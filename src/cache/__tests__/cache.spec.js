import Cache from '../index';
import { LRUCacheSingleton, cacheOptions } from '../lruCache';

describe('Cache tests', () => {
  it('should initialise and save information as an object to the cache for the first time', () => {
    Cache.save('dummyId', 'someField', 'someValue');
    const savedValue = Cache.fetch('dummyId');
    expect(savedValue).toEqual({ someField: 'someValue' });
  });

  it('should update the existing object saved to cache with new information passed', () => {
    const value = Cache.save('dummyId', 'someField', 'someValue');
    expect(value).toEqual(true);
  });

  it('should delete an existing object with the passed key', () => {
    Cache.save('tempObject', 'someField', 'someValue');
    const cachedValue = Cache.fetch('tempObject');
    expect(cachedValue).toBeDefined();
    Cache.delete('tempObject');
    const deletedObject = Cache.fetch('tempObject');
    expect(deletedObject).toBeUndefined();
  });
});

describe('Cache Singleton', () => {
  it('should return an existing instance', () => {
    const cacheInstance = new LRUCacheSingleton(cacheOptions(60));
    const anotherInstance = new LRUCacheSingleton(cacheOptions(60));
    expect(cacheInstance).toEqual(anotherInstance);
  });

  it('should update the existing object saved to cache with new information passed', () => {
    const value = Cache.save('dummyId', 'someField', 'someValue');
    expect(value).toEqual(true);
  });
});
