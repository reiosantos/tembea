import DialogPrompts from '../DialogPrompts';
import sendDialogTryCatch from '../../../../helpers/sendDialogTryCatch';

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../../../helpers/sendDialogTryCatch', () => jest.fn());
jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    dialog: {
      open: jest.fn(() => Promise.resolve({
        status: true
      }))
    }
  }))
}));

describe('Dialog prompts test', () => {
  it('should test sendTripDetailsForm function when forSelf is false', async (done) => {
    const payload = jest.fn(() => ({ trigger_id: 'trigger' }));
    const result = await DialogPrompts.sendTripDetailsForm(payload, 'false');

    expect(result).toBe(undefined);
    done();
  });

  it('should test sendTripDetailsForm function when forSelf is true', async (done) => {
    const payload = jest.fn(() => ({ trigger_id: 'trigger' }));
    const result = await DialogPrompts.sendTripDetailsForm(payload, 'true');
    expect(result).toBe(undefined);
    done();
  });

  it('should test sendRescheduleTripForm function', async (done) => {
    const payload = jest.fn(() => ({ callback_id: 'calling' }));
    const result = await DialogPrompts.sendRescheduleTripForm(payload, 'call', 'state', 'dialog');

    expect(result).toBe(undefined);
    done();
  });

  it('should say chill', (done) => {
    const result = 'chill';
    expect(result).toBe('chill');
    done();
  });
});

describe('Decline dialog', () => {
  it('should send decline dialog', async (done) => {
    await DialogPrompts.sendDialogToManager({
      trigger_id: 'XXXXXXX'
    },
    'callback_id',
    'state',
    'dialogName');

    expect(sendDialogTryCatch).toBeCalled();
    done();
  });
});
