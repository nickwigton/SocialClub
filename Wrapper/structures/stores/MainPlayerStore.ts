import PlayerStore from './PlayerStore';
import Player from "../Player";
import { Client } from '../..';

export default class MainPlayerStore extends PlayerStore {
  constructor(client: Client, cacheLimit: number) {
    super(client, cacheLimit)
  }

  search(name: string): Promise<PlayerStore> {
    return this.client.api.get(`players/search/${name}`)
      .then(players => new PlayerStore(this.client, players.map((p: any) => {
          const player = new Player(this.client, p.name, p);
          this.set(player.id, player);
          return [player.id, player];
      })))
  }

  /**
   * Fetch a Player by ID
   * @param name ID of the Player
   */
  public byID(id: number, forceFetch = false): Promise<Player> {
    if(!forceFetch && this.has(id)){
      return Promise.resolve(this.get(id));
    }
    return this.client.api.get(`players/${id}`).then(p => {
      const player = new Player(this.client, p.name, p);
      this.set(player.id, player);
      return player;
    })
  }

  /**
   * Fetch a Player by name
   * @param name Name of the Payer
   */
  public byName(name: string, forceFetch = false): Promise<Player> {
    if(!forceFetch) {
      const player = this.find(p => p.name.toLowerCase() === name);
      if(player) return Promise.resolve(player);
    }
    return this.client.api.get(`players/names/${name}`).then(p => {
      const player = new Player(this.client, p.name, p);
      this.set(player.id, player);
      return player;
    })
  }
}
