import redis from 'redis-mock';
import util from 'util';

export default class RedisCacheSingleMock {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = util.promisify(this.client.get).bind(this.client);
  }

  getClient() {
    return this.client;
  }
}
