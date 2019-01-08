import RedisCacheSingleton from '../redisCache';

describe('Cache Singleton', () => {
  it('should return an existing instance', () => {
    const cacheInstance = new RedisCacheSingleton();
    const anotherInstance = new RedisCacheSingleton();
    expect(cacheInstance).toEqual(anotherInstance);
  });
});
