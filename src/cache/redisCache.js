import redis from 'redis';
import util from 'util';

class RedisCacheSingleton {
  constructor() {
    if (RedisCacheSingleton.exists) {
      return RedisCacheSingleton.instance;
    }
    this.client = redis.createClient();
    this.getAsync = util.promisify(this.client.get).bind(this.client);
    RedisCacheSingleton.instance = this;
    RedisCacheSingleton.exists = this;
  }

  getClient() {
    return this.client;
  }
}

export default RedisCacheSingleton;
