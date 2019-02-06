import redis from 'redis';
import RedisCacheSingleton from '../redisCache';
import redisClientMock, { redisMockBackend } from '../__mocks__/redisClientMock';


jest.spyOn(redis, 'createClient').mockReturnValue(redisClientMock);
describe('RedisCacheSingleton', () => {
  const cache = new RedisCacheSingleton();
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    redisClientMock.clear();
  });

  it('should return an existing instance', () => {
    const cacheInstance = new RedisCacheSingleton();
    const anotherInstance = new RedisCacheSingleton();
    expect(cacheInstance).toEqual(anotherInstance);
  });

  describe('save', () => {
    it('should save to cache', async (done) => {
      await cache.save('hello', 'world', 'earth');

      const data = redisMockBackend.get('hello');
      const result = JSON.parse(data);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('world');
      expect(result.world).toEqual('earth');
      done();
    });

    it('should add new field if key contains an object', async (done) => {
      await cache.save('theKey', 'firstValue', 'tembea-backend');
      await cache.save('theKey', 'secondValue', 'tembea-frontend');

      const data = redisMockBackend.get('theKey');
      const result = JSON.parse(data);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('firstValue');
      expect(result).toHaveProperty('secondValue');
      done();
    });
  });

  describe('fetch', () => {
    it('should return object if it exists', async (done) => {
      const [testKey, testValue] = ['ade', 'bendel'];

      redisMockBackend.set(testKey, JSON.stringify(testValue));
      const result = await cache.fetch(testKey);
      expect(result).toBeDefined();
      expect(result).toEqual(testValue);
      done();
    });
  });

  describe('saveObject', () => {
    it('should save entire object', async (done) => {
      const testKey = 'user';
      const testObject = { name: 'tomi', scores: [1, 2, 3] };

      await cache.saveObject(testKey, testObject);

      const result = redisMockBackend.get(testKey);
      expect(JSON.parse(result)).toEqual(testObject);
      done();
    });
  });

  describe('delete', () => {
    it('should remove from cache', async (done) => {
      const [testKey, testValue] = ['mc', 'oluomo'];
      await cache.saveObject(testKey, testValue);

      const resultBeforeDelete = redisMockBackend.get(testKey);
      expect(JSON.parse(resultBeforeDelete)).toEqual(testValue);

      await cache.delete(testKey);
      const resultAfterDelete = redisMockBackend.get(testKey);
      expect(resultAfterDelete).toBeUndefined();
      done();
    });
  });
});
