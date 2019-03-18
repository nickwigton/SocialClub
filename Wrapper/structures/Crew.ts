import Client from '../Client';
import Feed from './Feed.js';

/**
 * Represents a SocialClub Crew
 */
export default class Crew {
  public client: Client;
  public permissions: {
    join: boolean;
    leave: boolean;
    invite: boolean;
    recruit: boolean;
    requestInvite: boolean;
  }
  public createdAt: string;
  public color: string;
  public id: number;
  public motto: string;
  public tag: string;
  public type: string;
  public division: string;
  public memberCount: number;
  public open: boolean;
  public primary: boolean;
  public private: boolean;

  constructor(client: Client, public name: string, data?: RawCrew) {
    Reflect.defineProperty(this, 'client', { value: client });
    if(data) this._setup(data);
  }

  get url(): string {
    return this.name.toLowerCase().replace(/\s/g, '_');
  }

  public get link(): string {
    return `https://socialclub.rockstargames.com/member/${this.url}`;
  }

  /**
   * Refresh the Crew data
   */
  public refresh(): Promise<this> {
    return this.client.api.get(`crews/names/${this.name}`).then(d => this._setup(d));
  }
  
  public _setup(data: any): this {
    for(const [key, value] of Object.entries(data)){
      (this as any)[key] = value;
    }
    return this;
  }

  /**
   * Fetch the crew feed
   */
  public fetchFeed(): Promise<Feed> {
    const f = new Feed(this.client, 'crew', this.id)
    return f.refresh();
  }

  /**
   * Fetch the members of the crew
   */
  public fetchMembers(): Promise<CrewRank[]> {
    return this.client.api.get(`crews/${this.id}/players`)
      .then(ranks => ranks.map((r: any) => {
        r.players = new Map(r.players.map((p: any) => [p.id, p]))
        return r;
      }))
  }
}

export interface RawCrew {
  permissions: {
    join: boolean;
    leave: boolean;
    invite: boolean;
    recruit: boolean;
    requestInvite: boolean;
  }
  createdAt: string;
  color: string;
  id: number;
  motto: string;
  name: string;
  tag: string;
  type: string;
  division: string;
  memberCount: number;
  open: boolean;
  primary: boolean;
  private: boolean;
}

export interface CrewRank {
  id: number;
  name: string;
  permissions: {
    deleteFromWall: boolean;
    demote: boolean;
    editSettings: boolean;
    invite: boolean;
    kick: boolean;
    mangeRanks: boolean;
    postMessages: boolean;
    promote: boolean;
    publishMultipleEmblems: boolean;
    updateStatus: boolean;
    viewSettings: boolean;
    writeOnWall: boolean;
  },
  players: Map<number, CrewMember>;
}

export interface CrewMember {
  avatarURL: string;
  name: string;
  id: number;
  joinedAt: string;
  rank: number;
  tag: string;
  primaryCrew: {
    id: number;
    name : string;
    tag: string;
    color: string;
    private: boolean;
  }
}