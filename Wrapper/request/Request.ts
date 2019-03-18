import { MyPlayerConversations as Conversation } from '../../Server/Endpoints/MyPlayer';
import { PlayersFetchMessages as Message } from '../../Server/Endpoints/Players';
import Invite from '../structures/Invite';
import fetch from 'node-fetch';
import Client from '../Client';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'UPDATE' | 'DELETE';

/**
 * Class where the requests to the websocket are made
 */
export default class Request {
  /** Keep track of the handled invites, so they don't get emitted every 5 minutes */
  private handledInvites = new Set();

  /**
   * Constructor of Request class
   * @param client The main Client
   * @param port The port to access the localhost server
   */
  constructor(private client: Client, private port: number){
    setInterval(async () => {
      const act = await this.get('activity').catch(() => null);
      if(!act) return this.client.emit('disconnected');

      if(act.friendInvites + act.crewInvites + act.unreadMessages < act.total)
        this.client.emit('notifications', act.total - act.friendInvites - act.crewInvites - act.unreadMessages);

      // Check if there are friend invites, and if so, fetch them
      if(act.friendInvites > 0){
        const invites = await this.get('players/@me/friends/invites').catch(() => null);
        if(invites){
          for(const inv of invites){
            if(!this.handledInvites.has(inv.id)){
              this.handledInvites.add(inv.id);
              this.client.emit('friendInvite', new Invite(this.client, inv));
            }
          }
        } else {
          this.client.emit('error', new Error('Failed to fetch friend invites after activitycounts'))
        }
      }

      // Check if there are crew invites, and if so, fetch them
      if(act.crewInvites > 0){
        const invites = await this.get('players/@me/crews/invites').catch(() => null);
        if(invites){
          for(const inv of invites){
            if(!this.handledInvites.has(inv.id)){
              this.handledInvites.add(inv.id);
              this.client.emit('crewInvite', new Invite(this.client, inv));
            }
          }
        } else {
          this.client.emit('error', new Error('Failed to fetch crew invites after activitycounts'))
        }
      }

      // If there are unread messages, fetch them
      if(act.unreadMessages){
        const conv: Conversation = await this.get('players/@me/conversations/0').catch(() => null);
        if(conv){
          const players = conv.players.filter(p => p.newMessages);
          for(const { id, name } of players) {
            const m: Message[] = await this.get(`players/${id}/messages`).catch(() => null);
            if(m){
              m.filter(x => !x.read).forEach(x => this.client.emit('message', x))
            } else {
              this.client.emit('error', new Error(`Failed to fetch messages for ${name} (${id}) in activitycounts`));
            }
          }
        } else {
          this.client.emit('error', new Error('Failed to fetch conversation list after activitycounts'))
        }
      }
    }, 5 * 60 * 1000) // Activitycounts is done every 5 minutes
  }

  /**
   * The request function
   * @param endpoint The endpoint
   * @param args The arguments of the request, either Array or Object
   */
  private req(endpoint: string, method: Method, payload?: any): Promise<any> {
    const options: any = { method }
    if(payload){
      options.body = JSON.stringify(payload);
      options.headers = { 'Content-Type': 'application/json' }
    }
    return fetch(`http://localhost:${this.port}/${endpoint}`, options).then(res => {
      if(res.status === 204) return;
      if(res.ok) return res.json();
      throw new Error(`Recieved HTTP code ${res.status} (${res.statusText})`)
    })
  }

  public get(endpoint: string, payload?: any): Promise<any> {
    return this.req(endpoint, 'GET', payload);
  }

  public post(endpoint: string, payload?: any): Promise<any> {
    return this.req(endpoint, 'POST', payload);
  }

  public put(endpoint: string, payload?: any): Promise<any> {
    return this.req(endpoint, 'PUT', payload);
  }

  public patch(endpoint: string, payload?: any): Promise<any> {
    return this.req(endpoint, 'PATCH', payload);
  }

  public update(endpoint: string, payload?: any): Promise<any> {
    return this.req(endpoint, 'UPDATE', payload);
  }

  public delete(endpoint: string, payload?: any): Promise<any> {
    return this.req(endpoint, 'DELETE', payload);
  }
}
