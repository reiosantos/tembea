
const error = {
  message: 'error ocurs'
};

const cloudMockEngine = {
  saveFile: jest.fn(),
  getFile: jest.fn(),
  deleteFile: jest.fn()
};

export const cloudEngineWithExceptions = {
  saveFile: jest.fn().mockRejectedValue(error),
  getFile: jest.fn().mockRejectedValue(error),
  deleteFile: jest.fn().mockRejectedValue(error)
};

export default cloudMockEngine;
