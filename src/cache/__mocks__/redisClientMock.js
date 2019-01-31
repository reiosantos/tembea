const redisMockBackend = new Map();
const redisClientMock = {
  getAsync: async key => new Promise((resolve) => {
    const data = redisMockBackend.get(key);
    if (!data) resolve(null);
    resolve(data);
  }),
  setAsync: (key, value) => Promise.resolve(redisMockBackend.set(key, value)),
  setexAsync: (key, opt, value) => Promise.resolve(redisMockBackend.set(key, value)),
  delAsync: key => Promise.resolve(redisMockBackend.delete(key)),
  clear: () => redisMockBackend.clear()
};

export default redisClientMock;
