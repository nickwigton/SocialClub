import Client from "../Client";

/**
 * Crew of Player Feed on SocialClub
 */
export default class Feed {
  public client: Client;
  public activities: any[];

  constructor(client: Client, public type: 'crew' | 'player', public id: number) {
    Reflect.defineProperty(this, 'client', { value: client })
  }

  /**
   * Fetch the feed of the Player or Crew
   */
  public refresh(): Promise<Feed> {
    return this.client.api.get(`${this.type}s/${this.id}/feed`).then(d => {
      this.activities = d.activities;
      return this;
    })
  }

  /**
   * Remove certain activities from the Feed, there is a delay build in
   * @param acts Array of activites to delete
   */
  public async delete(acts: any[]): Promise<void> {
    if(acts.length === 0) return Promise.resolve();
    const a = acts.pop();
    this.client.api.delete(`${this.type}s/${this.id}/feed/activities/${a.id}`);
    return new Promise(r => setTimeout(r, 5000))
      .then(() => this.delete(acts));
  }
}
