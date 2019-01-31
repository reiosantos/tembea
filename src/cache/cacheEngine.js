import bugsnagHelper from '../helpers/bugsnagHelper';

class CacheEngine {
  constructor(cache) {
    this.cache = cache;
  }

  async save(key, field, value) {
    try {
      const result = this.cache.save(key, field, value);
      return result;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  async fetch(key) {
    try {
      const result = await this.cache.fetch(key);
      return result;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  saveObject(key, value) {
    try {
      const result = this.cache.saveObject(key, value);
      return result;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  delete(key) {
    try {
      const result = this.cache.del(key);
      return result;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}

export default CacheEngine;
