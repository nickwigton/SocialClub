import CrewStore from './CrewStore';
import Crew from "../Crew";
import { Client } from '../..';

export default class MainCrewStore extends CrewStore<Crew> {
  constructor(client: Client, cacheLimit: number) {
    super(client, cacheLimit)
  }

  search(name: string): Promise<CrewStore<Crew>> {
    return this.client.api.get(`crews/search/${name}`)
      .then(crews => new CrewStore<Crew>(this.client, crews.map((c: any) => {
          const crew = new Crew(this.client, c.name, c);
          this.set(crew.id, crew);
          return [crew.id, crew];
      })))
  }

  /**
   * Fetch a Crew by ID
   * @param name ID of the Crew
   */
  public byID(id: number, forceFetch = false): Promise<Crew> {
    if(!forceFetch && this.has(id)){
      return Promise.resolve(this.get(id));
    }
    return this.client.api.get(`crews/${id}`).then(c => {
      const crew = new Crew(this.client, c.name, c);
      this.set(crew.id, crew);
      return crew;
    })
  }

  /**
   * Fetch a Crew by name
   * @param name Name of the Crew
   */
  public byName(name: string, forceFetch = false): Promise<Crew> {
    name = name.toLowerCase();
    if(!forceFetch) {
      const crew = this.find(c => c.name.toLowerCase() === name);
      if(crew) return Promise.resolve(crew);
    }
    return this.client.api.get(`crews/names/${name}`).then(c => {
      const crew = new Crew(this.client, c.name, c);
      this.set(crew.id, crew);
      return crew;
    })
  }
}
