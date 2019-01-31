const mockEngine = {
  save: jest.fn(),
  fetch: jest.fn(),
  saveObject: jest.fn(),
  delete: jest.fn()
};

export const cacheEngineWithExceptions = {
  save: jest.fn().mockRejectedValue(),
  fetch: jest.fn().mockRejectedValue(),
  saveObject: jest.fn().mockRejectedValue(),
  delete: jest.fn().mockRejectedValue()
};

export default mockEngine;
