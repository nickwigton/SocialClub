import { createServer, ServerResponse, IncomingMessage } from 'http';
import { EventEmitter } from "events";
import { resolve } from 'path';
import { readdir } from 'fs';
import EndpointStore from './EndpointStore';
import Request from './Request';

export default class Server extends EventEmitter {
  public routes = new EndpointStore();
  private request = new Request(this);
  private allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

  constructor(port: number, path: string) {
    super();
    createServer((req, res) => this.process(req, res)).listen(port);
    this.loadEndpoints(path);
  }

  private loadEndpoints(path = './Endpoints') {
    return new Promise((res, rej) => {
      readdir(path, (err, files) => {
        if(err) return rej(err);
        for(const file of files.filter(f => f.endsWith('.js'))) {
          const Routes = require(resolve(`${path}/${file}`)).default;
          const routes = new Routes(this.execute);
          this.routes.addRoutes(routes._routes.map((r: any) => {
            r.path = `${Routes._basePath}/${r.path}`.replace(/^\/|\/$/g, '').split(/\/+/);
            r.execute = (...args: any[]) => routes[r.name](...args);
            return r;
          }))
          this.emit('routesLoaded', routes.constructor.name);
        }
        res();
      })
    })
  }

  public finishJSON(res: ServerResponse, data: any): void {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.write(JSON.stringify(data));
    res.end();
  }

  public notFound(res: ServerResponse): void {
    res.statusCode = 404;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end();
  }

  public emptyResponse(res: ServerResponse): void {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end();
  }

  public error(res: ServerResponse, e: any) {
    res.statusCode = 500;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(e));
    res.end();
  }

  private async process(req: IncomingMessage, res: ServerResponse) {
    if(!this.allowedMethods.has(req.method)){
      return this.error(res, { status: false, error: true })
    }

    if(req.url === '/screenshot') {
      const { url } = await this.getBody(req);
      const buffer = await this.request.screenshot(url);
      return this.finishJSON(res, { base64: buffer.toString('base64') })
    }

    const endpoint = this.routes.get(req.url, req.method);
    console.log(endpoint);
    if(!endpoint || !endpoint.execute) return this.notFound(res);
    try {
      const body = endpoint.body ? await this.getBody(req) : undefined;
      const data = await endpoint.execute(...endpoint.args, body);
      if(data.error) return this.error(res, data);
      if(endpoint.emptyResponse) return this.emptyResponse(res);
      return this.finishJSON(res, data);
    } catch(e) {
      this.emit('error', e);
      return this.error(res, { status: false, error: true });
    }
  }

  private getBody(req: IncomingMessage): Promise<any> {
    return new Promise(res => {
      let body: Uint8Array[] = [];
      req.on('data', d => body.push(d));
      req.on('end', () => res(JSON.parse(Buffer.concat(body).toString())));
    })
  }

  execute = (url: string, options: any = {}) => {
    return this.request.req(url, {
      method: 'GET',
      json: true,
      reqToken: false,
      body: undefined as any,
      ...options
    }).then(data => {
      if(typeof options.format === 'function') data = options.format(data);
      return data;
    })
  }
}

/* You can either require the Server class in your own application, or use the Command Line Interface  */
if(process.argv[1] === resolve(__dirname, './index.js') && process.argv.length > 2) {
  const port = process.argv.includes('--port') ? Number(process.argv[process.argv.indexOf('--port') + 1]) : 3000;
  const path = process.argv.includes('--endpoints') ? process.argv[process.argv.indexOf('--endpoints') + 1] : resolve(__dirname, './Endpoints');
  const server = new Server(port, path);
  if(process.argv.includes('--debug')) {
    server.on('routesLoaded', x => console.log(`WebServer loaded endpoint: ${x}`));
  }
  server.on('error', e => console.error(`Error at ${new Date()}\n`, e));
  server.on('ready', () => console.log('WebServer ready!'))
  server.on('disconnected', e => console.error('Disconnected!', e))
}
