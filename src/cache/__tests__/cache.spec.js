import Cache from '../index';
import { redisCache } from '../cacheEngine';

describe('Cache tests', () => {
  describe('save', () => {
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
