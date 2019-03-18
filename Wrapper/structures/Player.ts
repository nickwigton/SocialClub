import { PlayersFetchMessages as Message } from '../../Server/Endpoints/Players';
import BasePlayer, { RawPlayer } from './base/BasePlayer';
import CrewStore from './stores/CrewStore';
import Client from '../Client';
import Crew from './Crew';

/**
 * Player class
 */
export default class Player extends BasePlayer {
  public crews: CrewStore<Crew>;

  /**
   * Constructor function for a Player
   * @param client The main Client
   * @param name Name of the player
   * @param data Optional data to setup
   */
  constructor(client: Client, name: string, data?: RawPlayer) {
    super(client, name, data);
  }

  public _setup(data: RawPlayer): this {
    super._setup(data);

    this.crews = new CrewStore(this.client, 0, data.crews.map(c => {
      let crew = this.client.crews.get(c.id)
      if(!crew){
        crew = new Crew(this.client, c.name);
        this.client.crews.set(c.id, crew);
      }
      crew._setup(c);
      return [crew.id, crew] as [number, Crew];
    }))
  
    return this;
  }

  get primaryCrew(): Crew {
    return this.crews.get(this.primaryCrewID);
  }

  /**
   * Method to send the player a friend request
   */
  public addFriend(): Promise<void> {
    return this.client.api.post(`players/@me/friends/${this.id}`);
  }

  /**
   * Method to send the player a message
   * @param content The message content to send
   */
  public send(content: string): Promise<void> {
    return this.client.api.post(`players/${this.name}/messages`, { content });
  }

  /**
   * Method to fetch the message converstation
   */
  public fetchMessages(): Promise<Message[]> {
    return this.client.api.get(`players/${this.id}/messages`);
  }
}
