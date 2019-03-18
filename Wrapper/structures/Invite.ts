import Client from "../Client";

/**
 * Represents an Invite, either friendInvite or crewInvite
 */
export default class Invite {
  public id: number;
  public name: string;
  public type: 'friendInvite' | 'crewInvite';
  public message: string;
  public client: Client;

  constructor(client: Client, data: any) {
    Reflect.defineProperty(this, 'client', { value: client })
    this.id = data.id;
    this.name = data.name
    this.message = data.message;
    this.type = data.type;
  }

  /**
   * Accept the pending invite
   */
  public accept(): Promise<void> {
    return this.client.api.put(`players/@me/${this.type === 'crewInvite' ? 'crews' : 'friends'}/invites/${this.id}`);
  }

  /**
   * Cancel the pending invite
   */
  public cancel(): Promise<void> {
    return this.client.api.delete(`players/@me/${this.type === 'crewInvite' ? 'crews' : 'friends'}/invites/${this.id}`);
  }
}
