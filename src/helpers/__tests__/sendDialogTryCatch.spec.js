import WebClientSingleton from '../../utils/WebClientSingleton';
import sendDialogTryCatch from '../sendDialogTryCatch';

const instance = new WebClientSingleton();
describe('sendDialogTryCatch', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  it('should open dialog', async () => {
    const open = jest.spyOn(instance.web.dialog, 'open')
      .mockImplementationOnce(() => Promise.resolve({
        status: true
      }));
    await sendDialogTryCatch();
    expect(open).toHaveBeenCalled();
  });

  it('should handle error', async () => {
    const error = new Error('There was a problem processing your request');
    const open = jest.spyOn(instance.web.dialog, 'open')
      .mockImplementationOnce(() => Promise.reject(error));
    try {
      await sendDialogTryCatch();
      expect(open).toHaveBeenCalled();
    } catch (e) {
      expect(e).toEqual(error);
    }
  });
});
