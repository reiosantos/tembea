import CacheEngine from './cacheEngine';
import env from '../config/environment';
import RedisCacheSingleton from './redisCache';
import LRUCacheSingleton from './lruCache';

export const cacheEngine = env.REDIS_URL.startsWith('redis')
  ? new RedisCacheSingleton()
  : new LRUCacheSingleton();

const cache = new CacheEngine(cacheEngine);
export default cache;
