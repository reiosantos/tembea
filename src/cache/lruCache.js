import LRUCache from 'lru-cache';
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
    LRUCacheSingleton.instance = this;
    LRUCacheSingleton.exists = this;
  }

  getAsync(key) {
    return new Promise((resolve, reject) => {
      try {
        const result = this.cache.get(key);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async save(key, field, value) {
    const currentState = await this.fetch(key);
    if (!currentState) {
      return this.saveObject(key, { [field]: value });
    }
    currentState[field] = value;
    return this.cache.set(key, currentState);
  }

  async fetch(key) {
    const result = await this.getAsync(key);
    return result;
  }

  async saveObject(key, value) {
    const maxCacheAge = Utils.convertMinutesToSeconds(5);
    return new Promise((resolve, reject) => {
      try {
        const data = this.cache.set(key, value, maxCacheAge);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  async delete(key) {
    return new Promise((resolve, reject) => {
      try {
        this.cache.del(key);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  async flush() {
    return new Promise((resolve, reject) => {
      try {
        this.cache.reset();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default LRUCacheSingleton;
