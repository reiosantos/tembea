import CacheEngine from '../cacheEngine';
import mockEngine, { cacheEngineWithExceptions } from '../__mocks__/cacheEngineMock';
import { Bugsnag } from '../../helpers/bugsnagHelper';

describe('RedisCacheEngine tests', () => {
  let cacheEngine;

  beforeEach(() => {
    cacheEngine = new CacheEngine(mockEngine);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should contain a cache', () => {
    expect(cacheEngine.cache).toBeDefined();
    expect(cacheEngine.cache).toHaveProperty('save');
    expect(cacheEngine.cache).toHaveProperty('saveObject');
    expect(cacheEngine.cache).toHaveProperty('fetch');
    expect(cacheEngine.cache).toHaveProperty('delete');
  });

  describe('save', () => {
    it('should call backing cache save method', async (done) => {
      await cacheEngine.save('1', '2');
      expect(mockEngine.save).toBeCalledTimes(1);
      done();
    });
  });

  describe('fetch', () => {
    it('should call backing cache fetch method', async (done) => {
      await cacheEngine.fetch('hello');
      expect(mockEngine.fetch).toBeCalledTimes(1);
      done();
    });
  });

  describe('saveObject', () => {
    it('should call backing cache saveObject method', async (done) => {
      await cacheEngine.saveObject('hello', 'world');
      expect(mockEngine.saveObject).toBeCalledTimes(1);
      done();
    });
  });

  describe('delete', () => {
    it('should call backing cache delete method', async (done) => {
      await cacheEngine.delete('hell');
      expect(mockEngine.delete).toBeCalledTimes(1);
      done();
    });
  });

  describe('all methods should handle exceptions when it occurs', () => {
    let loggerSpy;
    beforeEach(() => {
      cacheEngine = new CacheEngine(cacheEngineWithExceptions);
    });

    it('should return undefined', async (done) => {
      loggerSpy = jest.spyOn(Bugsnag.prototype, 'log');

      await cacheEngine.save('hello', 'world');
      await cacheEngine.fetch('hello');
      await cacheEngine.saveObject('tembea', { name: 'Awesome Developers' });
      await cacheEngine.delete('hello');

      expect(loggerSpy).toBeCalledTimes(4);
      done();
    });
  });
});
