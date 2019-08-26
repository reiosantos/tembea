import WebClientSingleton from '../../utils/WebClientSingleton';
import sendDialogTryCatch from '../sendDialogTryCatch';
import bugsnagHelper from '../bugsnagHelper';

const getWebClientMock = (mock) => ({
  dialog: { open: mock }
});
describe('sendDialogTryCatch', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  it('should open dialog', async () => {
    const open = jest.fn().mockResolvedValue({ status: true });
    jest.spyOn(WebClientSingleton, 'getWebClient')
      .mockReturnValue(getWebClientMock(open));
    await sendDialogTryCatch();
    expect(open).toHaveBeenCalled();
  });

  it('should handle error', async () => {
    const error = new Error('There was a problem processing your request');
    const open = jest.fn().mockRejectedValue(error);
    jest.spyOn(WebClientSingleton, 'getWebClient')
      .mockReturnValue(getWebClientMock(open));
    jest.spyOn(bugsnagHelper, 'log').mockReturnValue();
    try {
      await sendDialogTryCatch();
      expect(bugsnagHelper.log).toHaveBeenCalled();
    } catch (e) {
      expect(bugsnagHelper.log).toHaveBeenCalledWith(error);
      expect(e).toEqual(error);
    }
  });
});
