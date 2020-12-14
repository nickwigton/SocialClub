import Server from './index';
import parseStats, { PlayerStats } from './Endpoints/parsing/stats';
import Browser from './Browser';

// Let TypeScript shut up about document not being defined
const document: any = null;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: any;
  credentials?: 'omit' | 'same-origin' | 'include';
  refreshAccess?: boolean;

  json?: boolean;
  reqToken?: boolean;
}

export default class Request extends Browser {
  private reqToken: string;

  constructor(server: Server) {
    super(server);
    // Make sure to have a valid reqToken
    this.server.on('ready', () => this.req('https://socialclub.rockstargames.com/', { json: false, reqToken: true }))
  }

  public fetchStats(name: string): Promise<PlayerStats> {
    return Promise.all([
      this.req(`https://socialclub.rockstargames.com/games/gtav/StatsAjax?character=Freemode&category=Career&nickname=${name}&slot=Freemode`, { json: false, reqToken: true }),
      this.req(`https://socialclub.rockstargames.com/games/gtav/career/overviewAjax?character=Freemode&nickname=${name}&slot=Freemode`, { json: false, reqToken: true }),
      this.req(`https://socialclub.rockstargames.com/gtav/GarageAjax?nickname=${name}&slot=Freemode`, { json: false, reqToken: true }),
    ]).then(res => {
      const stats = parseStats(res[0], res[1], res[2]);
      if(stats) stats.name = name;
      return stats;
    })
  }

  public async req(url: string, { json, reqToken, ...options }: RequestOptions): Promise<any> {
    if(url.startsWith('stats/')) return this.fetchStats(url.slice(6));

    // Add a bearer token if needed, stringify payload, ect...
    options = await this.prepRequest(options, reqToken);

    // Perform the actuall request
    let res = await this.fetch(url, options, json);
    if(res.status === false && res.code === 401){
      // Refresh the bearer, and re-try
      if(await this.refreshBearer()){
        options = await this.prepRequest(options, reqToken);
        res = await this.fetch(url, options, json);
      } else throw new Error('DISCONNECTED');
    }

    // If the request failed, reject emit the error, and reject
    if(!res.status){
      this.server.emit('error', {
        url,
        options,
        json,
        reqToken,
        e: res.e,
        code: res.code,
        body: res.body
      })
      throw new Error('REQUEST_FAILED');
    }

    // If the response is in JSON, we can return it, otherwise, check if the request failed or if there was a reqToken present
    if(json) return res.body;
    if(typeof res.body === 'string'){
      if(res.body.includes('<p>Too many requests are being made from your IP address.</p>'))
        throw new Error('RATE_LIMIT');
      if(res.body.includes('<p>An error occurred while processing</p>') || res.body.includes('HTTP Error 400. The request URL is invalid.'))
        throw new Error('ERROR_WHILE_PROCESSING');
      if(res.body.includes('__RequestVerificationToken" type="hidden" value="'))
        this.reqToken = res.body.split('__RequestVerificationToken" type="hidden" value="')[1].split('"')[0];
    }
    return res.body;
  }

  private async prepRequest(options: RequestOptions, reqToken: boolean): Promise<RequestOptions> {
    options.headers = options.headers || {};
    if(reqToken){
      options.headers.requestVerificationToken = this.reqToken;
    } else {
      options = {
        ...options,
        credentials: 'omit',
        headers: {
          'authorization': 'Bearer ' + await this.getBearer(),
          'x-requested-with': 'XMLHttpRequest',
          'x-lang': 'en-US', 
          'x-cache-ver': 0
        }
      }
    }
    if(options.body){
      options.body = JSON.stringify(options.body);
      options.headers['Content-Type'] = 'application/json';
    }
    return options;
  }

  private getBearer(): Promise<string> {
    return this.page.evaluate(() => document.cookie.toString().split('BearerToken=')[1].split(';')[0]);
  }

  private async refreshBearer() {
    const options = {
      body: "accessToken=" + encodeURIComponent(await this.getBearer()),
      credentials: "same-origin" as "same-origin",
      headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      method: "POST" as "POST"
    }
    return this.fetch('https://socialclub.rockstargames.com/connect/refreshaccess', options, false)
      .then(() => true)
      .catch(e => void this.server.emit('disconnected', e))
  }
}
