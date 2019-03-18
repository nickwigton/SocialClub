import { RoutingData } from "./Decorators";

/**
 * Class that stores endpoint based on a tree structure
 */
export default class EndpointStore {
  /**
   * The head of the request url tree per request method
   */
  public routes: { [index: string]: Leave } = {
    'GET': new Leave(),
    'POST': new Leave(),
    'PATCH': new Leave(),
    'PUT': new Leave(),
    'UPDATE': new Leave(),
    'DELETE': new Leave()
  }

  /**
   * Add routes to the EndpointStore
   * @param data The RoutingData
   */
  public addRoutes(data: RoutingData[]) {
    for(const endpoint of data) {
      this.addEndpoint(endpoint, this.routes[endpoint.method]);
    }
  }

  /**
   * Private method to add a single endpoint. This method is recursive
   * @param data RoutingData
   * @param tree The head of the (sub)tree
   */
  private addEndpoint(data: RoutingData, tree: Leave): void {
    if(data.path.length === 0) {
      tree.value = data;
      return;
    }
    const segment = data.path[0].startsWith(':') ? '{arg}' : data.path[0];
    data.path.shift();
    const nextTree = tree.getLeave(segment);
    if(nextTree) return this.addEndpoint(data, nextTree);
    return this.addEndpoint(data, tree.addLeave(segment));
  }

  /**
   * Get an endpoint from the EndpointStore with a given request url
   * @param path Request path
   * @param method Request method
   */
  public get(path: string, method: string) {
    return this.getEndpoint(path.replace(/^\/|\/$/g, '').split(/\/+/), this.routes[method]);
  }

  /**
   * Private helper function of `get`. This is a recursive method
   * @param path The (partial) request path
   * @param tree Head of the (sub)tree
   * @param args Stores the arguments in the request path: /players/:payerIDArgument/crews/:crewIDArgument
   */
  private getEndpoint(path: string[], tree: Leave, args: string[] = []): RoutingData | undefined {
    if(path.length === 0) return { ...tree.value, args };
    const segment = path.shift();
    const leave = tree.getLeave(segment);
    if(!leave) return;
    const noArg = this.getEndpoint(path.slice(), leave, args);
    if(noArg) return noArg;
    args.push(path[0]);
    path[0] = '{arg}';
    return this.getEndpoint(path, leave, args);
  }
}

/**
 * Small class used by the EndpointStore
 */
class Leave {
  /**
   * The children of the class.
   */
  private children = new Map<string, Leave>();

  /**
   * Constructor function of a Leave
   * @param value Given endpoint data for this Leave
   */
  constructor(public value?: any) {}

  /**
   * Add a Leave to the children of this Leave
   * @param name Name of the leave
   * @param value Optional value to set
   */
  addLeave(name: string, value?: any) {
    const endpointLeave = new Leave(value);
    this.children.set(name, endpointLeave);
    return endpointLeave;
  }

  /**
   * Get on of the child leaves of this Leave
   * @param name Name of th leave
   */
  getLeave(name: string) {
    return this.children.get(name);
  }
}
