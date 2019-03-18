import { PlayersFetchMessages as Message } from '../../Server/Endpoints/Players';
import BasePlayer, { RawPlayer } from './base/BasePlayer';
import CrewStore from './stores/CrewStore';
import MyCrew from './MyCrew';
import Crew from './Crew';

/**
 * The Player that you are logged in as, is the MyPlayer; it has extended functionality over the Player class
 */
export default class MyPlayer extends BasePlayer {
  public crews: CrewStore<MyCrew>;

  public _setup(data: RawPlayer): this {
    super._setup(data);

    this.crews = new CrewStore(this.client, 0, data.crews.map(c => {
      const myCrew = new MyCrew(this.client, c.name, c);
      if(!this.client.crews.has(c.id)) {
        const crew = new Crew(this.client, c.name, c);
        this.client.crews.set(crew.id, crew);
      }
      return [myCrew.id, myCrew] as [number, MyCrew];
    }))

    return this;
  }

  get primaryCrew(): MyCrew {
    return this.crews.get(this.primaryCrewID);
  }

  /**
   * Add a player by name
   * @param name The name of the other player
   */
  public addFriend(name: string): Promise<void> {
    return this.client.players.byName(name).then(player => player.addFriend());
  }

  /**
   * Send a player a message by name
   * @param name The name of the other player
   * @param msg The message content
   */
  public send(name: string, msg: string): Promise<void> {
    return this.client.players.byName(name).then(player => player.send(msg));
  }

  /**
   * Fetch messages by name
   * @param name The name of the other player
   */
  public fetchMessages(name: string): Promise<Message[]> {
    return this.client.players.byName(name).then(player => player.fetchMessages());
  }
}
