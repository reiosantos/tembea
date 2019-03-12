import LRUCache from 'lru-cache';
import LRUCacheSingleton from '../lruCache';

describe('LRUCacheSingleton', () => {
  let cache = new LRUCacheSingleton();
  beforeEach(() => {
    cache = new LRUCacheSingleton();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    cache.cache.reset();
  });

  it('should return an existing instance', () => {
    const cacheInstance = new LRUCacheSingleton();
    const anotherInstance = new LRUCacheSingleton();
    expect(cacheInstance).toEqual(anotherInstance);
    expect(cacheInstance).toHaveProperty('getAsync');
    expect(cacheInstance).toHaveProperty('cache');
  });

  describe('getAsync', () => {
    it('should wrap call to cache.get', () => {
      jest.spyOn(LRUCache.prototype, 'get').mockRejectedValue(new Error());
      try {
        cache.getAsync('hello');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe('save', () => {
    it('should call backing cache save method', async (done) => {
      await cache.save('hello', 'world', 'earth');

      const result = cache.cache.get('hello');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('world');
      expect(result.world).toEqual('earth');
      done();
    });

    it('should add new field if key contains an object', async (done) => {
      await cache.save('theKey', 'firstValue', 'tembea-backend');
      await cache.save('theKey', 'secondValue', 'tembea-frontend');

      const result = await cache.cache.get('theKey');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('firstValue');
      expect(result).toHaveProperty('secondValue');
      done();
    });
  });

  describe('fetch', () => {
    it('should return object if it exists', async (done) => {
      const [testKey, testValue] = ['ade', 'bendel'];

      cache.cache.set(testKey, testValue);
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

      const result = cache.cache.get(testKey);
      expect(result).toEqual(testObject);
      done();
    });

    it('should throw an error when saving failed', async () => {
      jest.spyOn(LRUCache.prototype, 'set').mockRejectedValue(new Error());
      try {
        await cache.saveObject('hello', { key: 'value' });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe('delete', () => {
    it('should remove from cache', async (done) => {
      const [testKey, testValue] = ['mc', 'oluomo'];
      await cache.saveObject(testKey, testValue);

      const resultBeforeDelete = cache.cache.get(testKey);
      expect(resultBeforeDelete).toEqual(testValue);

      await cache.delete(testKey);
      const resultAfterDelete = cache.cache.get(testKey);
      expect(resultAfterDelete).toBeUndefined();
      done();
    });

    it('should throw an error when deletion failed', async () => {
      jest.spyOn(LRUCache.prototype, 'del').mockRejectedValue(new Error());
      try {
        await cache.delete('key');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe('Flush', () => {
    it('should flush all cached data', async () => {
      const testKey = 'user';
      await cache.save(testKey, 'tomi', 'age');
      await cache.save(testKey, 'kica', 'scores');

      const result = cache.cache.get(testKey);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('tomi');
      expect(result).toHaveProperty('kica');

      await cache.flush();
      const data = cache.cache.get(testKey);
      expect(data).toBeUndefined();
    });

    it('should throw an error when flushing fails', async () => {
      jest.spyOn(LRUCache.prototype, 'reset').mockRejectedValue(new Error());
      try {
        await cache.flush();
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });
});
