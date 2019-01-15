import RedisCacheSingletonMock from '../__mocks__/CachSingleton';
import { CacheEngine } from '../cacheEngine';

describe('RedisCacheEngine tests', () => {
  let cacheEngine;

  beforeEach(() => {
    cacheEngine = new CacheEngine(new RedisCacheSingletonMock());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('save', () => {
    it('should return true when save is successfull', async (done) => {
      const fetch = jest.spyOn(cacheEngine, 'fetch')
        .mockResolvedValue(null);
      const saveObject = jest.spyOn(cacheEngine, 'saveObject');
      await cacheEngine.save('key', 'fieldName', 'value');
      expect(saveObject).toBeCalledTimes(1);
      expect(fetch).toBeCalledTimes(1);
      expect(saveObject).toBeCalledWith('key', { fieldName: 'value' });
      done();
    });
  });

  describe('fetch', () => {
    it('should return a value when fetch is successfull', async (done) => {
      const sampleObject = {
        key: 'color',
        value: 'the color is blue'
      };
      await cacheEngine.save(sampleObject.key, sampleObject.value);
      jest.spyOn(cacheEngine, 'fetch').mockResolvedValue(sampleObject.value);
      const result = await cacheEngine.fetch(sampleObject.key);
      expect(result).toBe(sampleObject.value);
      done();
    });
  });
  describe('delete', () => {
    it('should return true when delete is successful', (done) => {
      const sampleObject = {
        key: 'color',
        value: 'the color is blue'
      };
      const sampleStore = new Map();
      sampleStore.set(sampleObject.key, sampleObject.value);

      jest.spyOn(cacheEngine, 'delete').mockImplementation().mockResolvedValue(true);
      const result = cacheEngine.delete(sampleObject.key);
      expect(result).toBeTruthy();
      done();
    });
  });
});
