import CacheEngine from './cacheEngine';
import env from '../config/environment';
import RedisCacheSingleton from './redisCache';
import LRUCacheSingleton from './lruCache';

export const cache = env.REDIS_URL.startsWith('redis')
  ? new RedisCacheSingleton()
  : new LRUCacheSingleton();

const cacheEngine = new CacheEngine(cache);
export default cacheEngine;
