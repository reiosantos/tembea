import Cache from '../index';
import { redisCache } from '../cacheEngine';
import bugsnagHelper from '../../helpers/bugsnagHelper';

describe('Cache tests', () => {
  describe('save', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should update the cached information already saved with new information', async () => {
      const mockObject = { mockedValue: 'mockedValue' };
      redisCache.cache = {
        getClient: () => ({
          set: () => mockObject
        })
      };
      redisCache.fetch = jest.fn().mockReturnValue({ testValue: 'testValue' });

      const result = await redisCache.save('key', 'field', 'value');
      expect(result).toEqual(mockObject);
    });

    it('should throw an exception if an error occurs while saving to the cache', async () => {
      const err = new Error();
      redisCache.fetch = jest.fn(() => Promise.reject(err));
      bugsnagHelper.log = jest.fn(() => {});

      try {
        await redisCache.save('key', 'field', 'value');
      } catch (e) {
        expect(bugsnagHelper.log).toHaveBeenCalled();
      }
    });

    it('should throw an exception if an error occurs while fetching from the cache', async () => {
      const err = new Error();
      redisCache.cache.getAsync = jest.fn(() => Promise.reject(err));
      bugsnagHelper.log = jest.fn(() => {});

      try {
        await redisCache.fetch('key');
      } catch (e) {
        expect(bugsnagHelper.log).toHaveBeenCalled();
      }
    });

    it('returns true when save is successful', async (done) => {
      const sampleObject = {
        key: 'hello',
        value: 'allan and shalon'
      };

      jest.spyOn(redisCache, 'save').mockImplementation().mockResolvedValue(true);
      const result = await Cache.save(sampleObject.key, sampleObject.value);
      expect(result).toBeTruthy();
      done();
    });
  });

  describe('fetch', () => {
    it('should return the object value', async (done) => {
      const sampleObject = {
        key: 'hello',
        value: 'allan and shalon'
      };
      const sampleStore = new Map();
      sampleStore.set(sampleObject.key, sampleObject.value);

      jest.spyOn(redisCache, 'fetch').mockImplementation(async key => sampleStore.get(key));
      const result = await Cache.fetch(sampleObject.key);
      expect(result).toBe(sampleObject.value);
      done();
    });
  });

  describe('delete', () => {
    it('should return true when delete is successful', (done) => {
      const sampleObject = {
        key: 'color',
        value: 'blue'
      };
      const sampleStore = new Map();
      sampleStore.set(sampleObject.key, sampleObject.value);

      jest.spyOn(redisCache, 'delete').mockImplementation().mockResolvedValue(true);
      const result = Cache.delete(sampleObject.key);
      expect(result).toBeTruthy();
      done();
    });
  });

  describe('saveObject', () => {
    it('should return true when an object is saved successfully', (done) => {
      const sampleObject = {
        key: 'color',
        value: 'blue'
      };
      const sampleStore = new Map();
      sampleStore.set(sampleObject.key, sampleObject.value);

      jest.spyOn(redisCache, 'saveObject').mockImplementation().mockResolvedValue(true);
      const result = Cache.saveObject(sampleObject.key, sampleObject.value);
      expect(result).toBeTruthy();
      done();
    });
  });
});
