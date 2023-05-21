type CallableCache = {
  (): void;
} & Cache;

export class Cache implements ICache {
  data: ICacheBase;

  get(key: string) {
    return this.data[key];
  }

  set(key: string, value: any) {
    this.data[key] = value;
  }

  get keys() {
    return Object.keys(this.data);
  }

  constructor() {
    this.data = {
      terminal: {},
      requests: {}
    };
  }

  public static callable(): CallableCache {
    const cache = new Cache();

    return new Proxy(cache, {
      apply(target, thisArg, args) {
        console.log(`Called as a function with setter: ${target.set}`);
      }
    }) as CallableCache;
  }

  get [Symbol.toPrimitive]() {
    return this.get.bind(this);
  }
}

const cache = Cache.callable();
export default cache;
