import LRUCacheFactory from './lruCache';

const cache = LRUCacheFactory(60);

class Cache {
  static save(key, field, value) {
    const currentState = this.fetch(key);
    if (!currentState) {
      return cache.set(key, { [field]: value });
    }
    currentState[field] = value;
    return cache.set(key, currentState);
  }

  static saveObject(key, value) {
    return cache.set(key, value);
  }

  static fetch(key) {
    return cache.get(key);
  }
}

export default Cache;
