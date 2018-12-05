import LRUCache from 'lru-cache';

export const cacheOptions = maxAgeInMinutes => ({
  maxAge: 1000 * 60 * maxAgeInMinutes,
});

export const getInProcessTripKey = userId => `tripInProcess_${userId}`;

export class LRUCacheSingleton {
  constructor(options) {
    if (LRUCacheSingleton.exists) {
      return LRUCacheSingleton.instance;
    }
    this.cache = new LRUCache(options);
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
