import LRUCache from 'lru-cache';
import util from 'util';
import Utils from '../utils';

export const cacheOptions = maxAgeInMinutes => ({
  maxAge: Utils.convertMinutesToSeconds(maxAgeInMinutes),
});

export const getInProcessTripKey = userId => `tripInProcess_${userId}`;

export class LRUCacheSingleton {
  constructor(options) {
    if (LRUCacheSingleton.exists) {
      return LRUCacheSingleton.instance;
    }
    this.cache = new LRUCache(options);
    this.getAsync = util.promisify(this.cache.get).bind(this.cache);
    LRUCacheSingleton.instance = this;
    LRUCacheSingleton.exists = this;
  }

  getCache() {
    return this.cache;
  }
}

const LRUCacheFactory = (maxAge) => {
  const cache = new LRUCacheSingleton(cacheOptions(maxAge));
  return cache.getCache();
};

export default LRUCacheFactory;
