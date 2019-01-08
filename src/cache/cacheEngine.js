import bugsnagHelper from '../helpers/bugsnagHelper';
import Utils from '../utils';
import LRUCache from './lruCache';
import RedisCacheSingleton from './redisCache';

export class CacheEngine {
  constructor(cache) {
    this.cache = cache;
  }
  
  async save(key, field, value) {
    try {
      const currentState = await this.fetch(key);
      if (!currentState) {
        return this.saveObject(key, { [field]: value });
      }
      currentState[field] = value;
  
      return this.cache.getClient().set(key, JSON.stringify(currentState));
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
  
  async fetch(key) {
    try {
      const result = await this.cache.getAsync(key);
      const data = JSON.parse(result);
      return data;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
  
  saveObject(key, value) {
    const maxCacheAge = Utils.convertMinutesToSeconds(5);
    return this.cache.getClient().setex(key, maxCacheAge, JSON.stringify(value));
  }
  
  delete(key) {
    return this.cache.getClient().del(key);
  }
}
  
const redisCache = new CacheEngine(new RedisCacheSingleton());
const lruCache = new CacheEngine(LRUCache(5));

export { redisCache, lruCache };
