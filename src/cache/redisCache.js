import redis from 'redis';
import { promisify } from 'util';
import env from '../config/environment';
import Utils from '../utils';

class RedisCacheSingleton {
  constructor() {
    if (RedisCacheSingleton.exists) {
      return RedisCacheSingleton.instance;
    }
    this.client = redis.createClient(env.REDIS_URL);
    this.client.getAsync = promisify(this.client.get);
    this.client.setAsync = promisify(this.client.set);
    this.client.setexAsync = promisify(this.client.setex);
    this.client.delAsync = promisify(this.client.del);

    RedisCacheSingleton.instance = this;
    RedisCacheSingleton.exists = this;
  }

  async save(key, field, value) {
    const currentState = await this.fetch(key);
    if (!currentState) {
      return this.saveObject(key, { [field]: value });
    }
    currentState[field] = value;
    return this.client.setAsync(key, JSON.stringify(currentState));
  }

  async fetch(key) {
    const result = await this.client.getAsync(key);
    return result ? JSON.parse(result) : result;
  }

  async saveObject(key, value) {
    const maxCacheAge = Utils.convertMinutesToSeconds(5);
    return this.client.setexAsync(key, maxCacheAge, JSON.stringify(value));
  }

  async delete(key) {
    return this.client.delAsync(key);
  }
}

export default RedisCacheSingleton;
