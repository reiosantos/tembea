import env from '../config/environment';
import RedisCacheSingleton from './redisCache';
import LRUCacheSingleton from './lruCache';

const cache = env.REDIS_URL.startsWith('redis')
  ? new RedisCacheSingleton()
  : new LRUCacheSingleton();

export default cache;
