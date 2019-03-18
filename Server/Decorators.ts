export interface RoutingData {
  id: string,
  path: string[],
  method: string,
  body: boolean,
  emptyResponse: boolean,
  args?: string[],
  execute?: (...args: any[]) => any,
}

export function Routes(url: string) {
  return (target: any) => {
    target._basePath = url;
  }
}

function methodController(path: string, method: string) {
  return (target: any, name: string, descriptor: TypedPropertyDescriptor<Function>) => {
    if(!target._routes) target._routes = [];
    target._routes.push({
      id: `${target.constructor.name}${name.charAt(0).toUpperCase()}${name.slice(1)}`,
      name,
      path,
      method,
      body: false,
      emptyResponse: false
    })

    if(target._validateNumbers && target._validateNumbers[name]) {
      const method = descriptor.value;
      descriptor.value = function () {
        for(const x of target._validateNumbers[name]){
          arguments[x] = Number(arguments[x]);
          if(isNaN(arguments[x])) throw new Error('Invalid arguments');
        }
        return method.apply(this, arguments);
      }
    }
  }
}

export function int(target: any, name: string, index: number) {
  if(!target._validateNumbers) target._validateNumbers = {}
  if(!target._validateNumbers[name]) target._validateNumbers[name] = []
  target._validateNumbers[name].push(index);
}

export function Body(target: any, name: string) {
  const index = target._routes.findIndex((r: RoutingData) => r.id === `${target.constructor.name}${name.charAt(0).toUpperCase()}${name.slice(1)}`)
  const newValue = target._routes[index];
  newValue.body = true;
  target._routes[index] = newValue;
}

export function EmptyResponse(target: any, name: string) {
  const index = target._routes.findIndex((r: RoutingData) => r.id === `${target.constructor.name}${name.charAt(0).toUpperCase()}${name.slice(1)}`)
  const newValue = target._routes[index];
  newValue.emptyResponse = true;
  target._routes[index] = newValue;
}

export function GET(path: string, ) {
  return methodController(path, 'GET');
}

export function POST(path: string) {
  return methodController(path, 'POST');
}

export function PATCH(path: string) {
  return methodController(path, 'PATCH');
}

export function PUT(path: string) {
  return methodController(path, 'PUT');
}

export function UPDATE(path: string) {
  return methodController(path, 'UPDATE');
}

export function DELETE(path: string) {
  return methodController(path, 'DELETE');
}
