import RedisCacheSingleton from '../src/cache/redisCache';

describe.skip('RedisCacheSingleton', () => {
  let cache = new RedisCacheSingleton();
  beforeEach(() => {
    cache = new RedisCacheSingleton();
  });

  afterEach(() => {
    cache.client.flushdb(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
  });

  it('should return an existing instance', () => {
    const cacheInstance = new RedisCacheSingleton();
    const anotherInstance = new RedisCacheSingleton();
    expect(cacheInstance).toEqual(anotherInstance);
    expect(cacheInstance).toHaveProperty('client');
  });

  describe('save', () => {
    it('should call backing cache save method', async (done) => {
      await cache.save('hello', 'world', 'earth');

      const data = await cache.client.getAsync('hello');
      const result = JSON.parse(data);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('world');
      expect(result.world).toEqual('earth');
      done();
    });

    it('should add new field if key contains an object', async (done) => {
      await cache.save('theKey', 'firstValue', 'tembea-backend');
      await cache.save('theKey', 'secondValue', 'tembea-frontend');

      const data = await cache.client.getAsync('theKey');
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

      await cache.client.setAsync(testKey, JSON.stringify(testValue));
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

      const result = await cache.client.getAsync(testKey);
      expect(JSON.parse(result)).toEqual(testObject);
      done();
    });
  });

  describe('delete', () => {
    it('should remove from cache', async (done) => {
      const [testKey, testValue] = ['mc', 'oluomo'];
      await cache.saveObject(testKey, testValue);

      const resultBeforeDelete = await cache.client.getAsync(testKey);
      expect(JSON.parse(resultBeforeDelete)).toEqual(testValue);

      cache.client.delAsync(testKey);
      const resultAfterDelete = await cache.client.getAsync(testKey);
      expect(resultAfterDelete).toBeNull();
      done();
    });
  });
});
