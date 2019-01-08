import { redisCache as cache } from './cacheEngine';

class Cache {
  static async save(key, field, value) {
    return cache.save(key, field, value);
  }

  static async fetch(key) {
    return cache.fetch(key);
  }

  static saveObject(key, value) {
    return cache.saveObject(key, value);
  }

  static delete(key) {
    return cache.delete(key);
  }
}

export default Cache;
