import Store from "./Store";
import Crew from "../Crew";
import MyCrew from "../MyCrew";

export default class CrewStore<T extends Crew | MyCrew> extends Store<number, T> {
  formatRank(r: number): string {
    return ['Leader', 'Commissioners', 'Lieutenants', 'Representatives', 'Muscle'][r];
  }

  parseRank(str: string | number): number {
    if(typeof str === 'number') {
      if(str >= 0 && str <= 4) return str;
      return null;
    }
    const ranks = ['Leader', 'Commissioners', 'Lieutenants', 'Representatives', 'Muscle'];
    if(ranks.includes(str)) return ranks.indexOf(str);
    const n = parseInt(str);
    if(n >= 0 && n <= 4) return n;
    return null;
  }
}
