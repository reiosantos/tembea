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
    this.client.getAsync = promisify(this.getClient().get);
    this.client.setAsync = promisify(this.getClient().set);
    this.client.setexAsync = promisify(this.getClient().setex);
    this.client.delAsync = promisify(this.getClient().del);

    RedisCacheSingleton.instance = this;
    RedisCacheSingleton.exists = this;
  }

  getClient() {
    return this.client;
  }

  async save(key, field, value) {
    const currentState = await this.fetch(key);
    if (!currentState) {
      return this.saveObject(key, { [field]: value });
    }
    currentState[field] = value;
    return this.getClient().setAsync(key, JSON.stringify(currentState));
  }

  async fetch(key) {
    const result = await this.getClient().getAsync(key);
    return result ? JSON.parse(result) : result;
  }

  async saveObject(key, value) {
    const maxCacheAge = Utils.convertMinutesToSeconds(5);
    return this.getClient().setexAsync(key, maxCacheAge, JSON.stringify(value));
  }

  async delete(key) {
    return this.getClient().delAsync(key);
  }
}

export default RedisCacheSingleton;
