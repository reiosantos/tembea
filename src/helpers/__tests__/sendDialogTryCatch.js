import sendDialogTryCatch from '../sendDialogTryCatch';

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    dialog: {
      open: jest.fn(() => Promise.resolve({
        status: true
      }))
    }
  }))
}));

describe('sendDialogTryCatch', () => {
  it('should return undefined', () => {
    expect(sendDialogTryCatch()).toEqual(undefined);
  });
});
