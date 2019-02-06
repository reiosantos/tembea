export const redisMockBackend = new Map();
const redisClientMock = {
  get: (key, callbackFn) => {
    const data = redisMockBackend.get(key);
    return callbackFn(null, data || null);
  },
  set: (key, value, callbackFn) => {
    redisMockBackend.set(key, value);
    return callbackFn(undefined, true);
  },
  setex: (key, opt, value, callbackFn) => {
    redisMockBackend.set(key, value);
    return callbackFn(undefined, true);
  },
  del: (key, callbackFn) => {
    redisMockBackend.delete(key);
    return callbackFn(undefined, true);
  },
  clear: () => redisMockBackend.clear()
};

export default redisClientMock;
