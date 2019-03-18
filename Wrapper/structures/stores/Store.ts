import Client from "../../Client";

export default class Store<K, V> extends Map<K, V> {
  constructor(public client: Client, public readonly cacheLimit = 0, iterable?: Array<[K, V]>) {
    super(iterable);
  }

  set(key: K, value: V) {
    if(this.cacheLimit) {
      super.delete(key);
      if(this.size === this.cacheLimit) {
        const iter = this.keys();
        const toRemove = iter.next().value;
        this.delete(toRemove);
      }
    }
    return super.set(key, value);
  }

  find(fn: (value: V, key: K) => boolean): V {
    for(const [key, value] of this){
      if(fn(value, key)) return value;
    }
    return null;
  }

  array() {
    return [...this.values()];
  }

  map<T>(fn: (value: V, key: K) => T): T[] {
    const res = new Array(this.size);
    for(const [key, value] of this){
      res.push(fn(value, key))
    }
    return res;
  }

  reduce<T>(fn: (acc: T, val: V, key: K) => T, initialValue: T): T {
    for (const [key, val] of this){
      initialValue = fn(initialValue, val, key);
    }
    return initialValue;
  }
}
