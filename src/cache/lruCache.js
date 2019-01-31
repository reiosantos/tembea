import LRUCache from 'lru-cache';
import util from 'util';
import Utils from '../utils';

export const cacheOptions = maxAgeInMinutes => ({
  maxAge: Utils.convertMinutesToSeconds(maxAgeInMinutes),
});

class LRUCacheSingleton {
  constructor(maxAgeInMinutes = 5) {
    if (LRUCacheSingleton.exists) {
      return LRUCacheSingleton.instance;
    }
    this.cache = new LRUCache(cacheOptions(maxAgeInMinutes));
    this.getAsync = util.promisify(this.cache.get).bind(this.cache);
    LRUCacheSingleton.instance = this;
    LRUCacheSingleton.exists = this;
  }

  getCache() {
    return this.cache;
  }

  async save(key, field, value) {
    const currentState = await this.fetch(key);
    if (!currentState) {
      return this.saveObject(key, { [field]: value });
    }
    currentState[field] = value;
    return this.cache.set(key, JSON.stringify(currentState));
  }

  async fetch(key) {
    const result = await this.getAsync(key);
    const data = JSON.parse(result);
    return data;
  }

  saveObject(key, value) {
    const maxCacheAge = Utils.convertMinutesToSeconds(5);
    return this.cache.set(key, maxCacheAge, JSON.stringify(value));
  }

  delete(key) {
    return this.cache.del(key);
  }
}

export default LRUCacheSingleton;
