import WebClientSingleton from '../../utils/WebClientSingleton';
import sendDialogTryCatch from '../sendDialogTryCatch';

// mocking webclient singleton
jest.mock('../../utils/WebClientSingleton.js', () => jest.fn().mockImplementation(() => ({
  getWebClient: jest.fn(() => ({
    dialog: {
      open: jest.fn(() => Promise.resolve({
        status: true
      }))
    }
  }))
})));

describe('sendDialogTryCatch', () => {
  it('should return undefined', () => {
    sendDialogTryCatch();
    expect(WebClientSingleton).toHaveBeenCalled();
  });
});
