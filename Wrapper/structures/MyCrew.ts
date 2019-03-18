import Client from '../Client.js';
import Player from './Player.js';
import Crew, { RawCrew } from './Crew.js';
import { CrewsEmblems as Emblem } from '../../Server/Endpoints/Crews';

export type CrewRank = 'leader' | 'commissioners' | 'lieutenants' | 'muscle' | 'representatives' | '0' | '1' | '2' | '3' | '4' | 0 | 1 | 2 | 3 | 4;

/**
 * The crews where you are part of, more functionality than {Crew}
 */
export default class MyCrew extends Crew {
  constructor(client: Client, name: string, data?: RawCrew) {
    super(client, name, data);
  }

  /**
   * Fetch the embeds of the crew
   */
  public fetchEmblems(): Promise<Emblem[]> {
    return this.client.api.get(`crews/${this.id}/emblems`);
  }

  /**
   * Invite a Player to the crew
   * @param player The player to invite
   * @param rank Rank to invite to
   * @param msg Optional messasage
   */
  public invite(player: Player): Promise<void> {
    return this.client.api.put(`crews/${this.id}/invites/${player.name}`);
  }

  /**
   * Kick a Player from the crew
   * @param player The player to kick
   */
  public kick(player: Player): Promise<void> {
    return this.client.api.delete(`crews/${this.id}/players/${player.id}`)
      .then(() => void player.crews.delete(this.id));
  }

  /**
   * Promote a player
   * @param player The player to promote
   * @param newRank The new rank for the player
   */
  public promote(player: Player, newRank: CrewRank): Promise<void> {
    return this.client.api.patch(`crews/${this.id}/players/${player.id}/ranks/${newRank}`);
  }

  /**
   * Demote a player
   * @param player The player to demote
   * @param newRank The new rank for the player
   */
  public demote(player: Player, newRank: CrewRank): Promise<void> {
    return this.client.api.patch(`crews/${this.id}/players/${player.id}/ranks/${newRank}`);
  }
}
