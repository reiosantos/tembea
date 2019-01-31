import bugsnagHelper from '../helpers/bugsnagHelper';

class CacheEngine {
  constructor(cache) {
    this.cache = cache;
  }

  async save(key, field, value) {
    try {
      const result = await this.cache.save(key, field, value);
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

  async saveObject(key, value) {
    try {
      const result = await this.cache.saveObject(key, value);
      return result;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  async delete(key) {
    try {
      const result = await this.cache.delete(key);
      return result;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}

export default CacheEngine;
