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
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripDetailsForm(payload, 'false');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendTripDetailsForm function when forSelf is true', async (done) => {
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripDetailsForm(payload, 'true');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendRescheduleTripForm function', async (done) => {
    const payload = { callback_id: 'calling', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendRescheduleTripForm(payload, 'call', 'state', 'dialog');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendTripReasonForm function', async (done) => {
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripReasonForm(payload);
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendCommentDialog function', async (done) => {
    await DialogPrompts.sendOperationsDeclineDialog({
      message_ts: 'trigger',
      actions: ['value', ''],
      team: { id: 'TEAMID1' }
    });
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendOperationsApprovalDialog function', async (done) => {
    await DialogPrompts.sendOperationsApprovalDialog({
      actions: ['value', ''],
      trigger_id: 'trigger',
      channel: {
        id: 'XXXXXXXX'
      },
      team: { id: 'TEAMID1' }
    });

    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });
});

describe('Decline dialog', () => {
  it('should send decline dialog', async (done) => {
    await DialogPrompts.sendDialogToManager({
      trigger_id: 'XXXXXXX',
      team: { id: 'TEAMID1' }
    },
    'callback_id',
    'state',
    'dialogName');

    expect(sendDialogTryCatch).toBeCalled();
    done();
  });
});
