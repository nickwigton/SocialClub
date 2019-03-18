import { StatsFetch as Stats } from '../../../Server/Endpoints/Stats';
import Client from '../../Client';
import Feed from '../Feed';
import RawCrew from '../Crew';

/**
 * Base Player class, should NOT be initiated
 * Implemented in either MyPlayer or Player
 */
export default class BasePlayer {
  public client: Client;
  public id: number;
  public relation: string;
  public blockable: boolean;
  public statsOpen: boolean;
  public profileHidden: boolean;
  public wallHidden: boolean;
  public country: string;
  public friendCount: number;
  public crewMate: boolean;
  public gamesOwned: any[];
  public primaryCrewID: number;
  public lastUpdated: number;

  /**
   * Constructor function for a Player
   * @param client The main Client
   * @param name Name of the player
   * @param data Optional data to setup
   */
  constructor(client: Client, public name: string, data?: RawPlayer) {
    Reflect.defineProperty(this, 'client', { value: client })
    if(data) this._setup(data);
  }

  public refresh(): Promise<this> {
    return this.client.api.get(`players/names/${this.name}`)
      .then(d => this._setup(d));
  }

  public _setup({ primaryCrew, crews, ...data }: RawPlayer): this {
    this.primaryCrewID = primaryCrew.id;
    for(const [key, value] of Object.entries(data)){
      (this as any)[key] = value;
    }
    this.lastUpdated = Date.now();
    return this;
  }

  public get link(): string {
    return `https://socialclub.rockstargames.com/member/${this.name}`;
  }

  /**
   * The avatarURL of the player
   */
  public get avatarURL(): string {
    return `https://a.rsg.sc/n/${this.name.toLowerCase()}/s`;
  }

  /**
   * Fetch the stats of the Player
   */
  public fetchStats(): Promise<Stats> {
    return this.client.api.get(`players/${this.name}/stats`);
  }

  /**
   * Fetch the player feed
   */
  public fetchFeed(): Promise<Feed> {
    const f = new Feed(this.client, 'player', this.id);
    return f.refresh();
  }

  /**
   * Fetch the mugshot url of the Player
   */
  public fetchMugshot(): Promise<string> {
    return this.client.api.get(`players/${this.id}/mugshot`).then(m => m.url);
  }

  /**
   * Fetches the modder record
   */
  public modderRecord(): Promise<string> {
    return this.client.records.modderRecord(this.name);
  }

  /**
   * Fetches the financial record
   */
  public financialRecord(): Promise<string> {
    return this.client.records.financialRecord(this.name);
  }

  /**
   * Fetches the criminal record
   */
  public criminalRecord(): Promise<string> {
    return this.client.records.criminalRecord(this.name);
  }
}

export interface RawPlayer {
  id: number;
  name: string;
  relation: string;
  blockable: boolean;
  statsOpen: boolean;
  profileHidden: boolean;
  wallHidden: boolean;
  country: string;
  friendCount: number;
  crewMate: boolean;
  gamesOwned: any[];
  primaryCrew: {
    id: number;
    name: string;
    color: string;
    tag: string;
    rank: number;
  },
  crews: RawCrew[];
}
