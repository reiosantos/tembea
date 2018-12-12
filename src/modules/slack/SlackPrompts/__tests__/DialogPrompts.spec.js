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
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should test sendTripDetailsForm function when forSelf is false', async (done) => {
    const payload = jest.fn(() => ({ trigger_id: 'trigger' }));
    await DialogPrompts.sendTripDetailsForm(payload, 'false');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendTripDetailsForm function when forSelf is true', async (done) => {
    const payload = jest.fn(() => ({ trigger_id: 'trigger' }));
    await DialogPrompts.sendTripDetailsForm(payload, 'true');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendRescheduleTripForm function', async (done) => {
    const payload = jest.fn(() => ({ callback_id: 'calling' }));
    await DialogPrompts.sendRescheduleTripForm(payload, 'call', 'state', 'dialog');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });
});

describe('send trip reason should send a dialog form', () => {
  afterEach(() => jest.resetAllMocks());
  it('should make a call to sendDialogTryCatch', async (done) => {
    const payload = {
      trigger_id: 'trip_reason'
    };
    await DialogPrompts.sendTripReasonForm(payload);
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });
});

describe('send dialog to manager should send a dialog form', () => {
  it('should make a call to sendDialogTryCatch', async (done) => {
    const payload = {
      trigger_id: 'trip_reason'
    };
    await DialogPrompts.sendDialogToManager(payload);
    expect(sendDialogTryCatch).toBeCalledTimes(1);
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
