import { LRUCacheSingleton } from '../lruCache';

describe('Cache Singleton', () => {
  it('should return an existing instance', () => {
    const cacheInstance = new LRUCacheSingleton();
    const anotherInstance = new LRUCacheSingleton();
    expect(cacheInstance).toEqual(anotherInstance);
  });
});
