import redis from 'redis';
import util from 'util';
import env from '../config/environment';

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
}

export default RedisCacheSingleton;
