import redis from 'redis';
import util from 'util';
import env from '../config/environment';
import Utils from '../utils';

class RedisCacheSingleton {
  constructor() {
    if (RedisCacheSingleton.exists) {
      return RedisCacheSingleton.instance;
    }
    this.client = redis.createClient(env.REDIS_URL);
    this.getAsync = util.promisify(this.client.get).bind(this.client);
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
    return this.client.set(key, JSON.stringify(currentState));
  }

  async fetch(key) {
    const result = await this.getAsync(key);
    const data = JSON.parse(result);
    return data;
  }

  saveObject(key, value) {
    const maxCacheAge = Utils.convertMinutesToSeconds(5);
    return this.client.setex(key, maxCacheAge, JSON.stringify(value));
  }

  delete(key) {
    return this.client.del(key);
  }
}

export default RedisCacheSingleton;
