import DialogPrompts from '../DialogPrompts';
import sendDialogTryCatch from '../../../../helpers/sendDialogTryCatch';

jest.mock('../../../../services/TeamDetailsService', () => ({
  getTeamDetailsBotOauthToken: async () => 'just a random token'
}));

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../../../helpers/sendDialogTryCatch', () => jest.fn());
jest.mock('../../../../helpers/slack/createDialogForm', () => jest.fn());

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

  it('should test sendTripDetailsForm function', async (done) => {
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripDetailsForm(payload, 'someFunctionName', 'someCallbackId');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendSkipPage function', async (done) => {
    const payload = { actions: [{ name: 'skipPage' }], team: { id: 'TEAMID1' } };
    await DialogPrompts.sendSkipPage(payload, 'view_upcoming_trips');
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

  it('should test sendLocationForm function', async (done) => {
    await DialogPrompts.sendLocationForm({
      actions: ['value', ''],
      trigger_id: 'trigger',
      channel: {
        id: 'XXXXX'
      },
      team: { id: 'TEAMID1' }
    });

    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should sendLocationCoordinatesForm', async (done) => {
    await DialogPrompts.sendLocationCoordinatesForm({
      trigger_id: 'XXXXXXX',
      team: { id: 'TEAMID1' }
    });

    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should send sendOperationsNewRouteApprovalDialog dialog', async (done) => {
    const state = JSON.stringify({
      approve: {
        timeStamp: '123848', channelId: 'XXXXXX', routeRequestId: '1'
      }
    });
    await DialogPrompts.sendOperationsNewRouteApprovalDialog({
      trigger_id: 'XXXXXXX',
      team: { id: 'TEAMID1' }
    }, state);

    expect(sendDialogTryCatch).toBeCalledTimes(1);
    done();
  });

  it('should test sendEngagementInfoDialogToManager function', async () => {
    const payload = {
      callback_id: 'calling',
      team: { id: 'TEAMID1' }
    };
    await DialogPrompts.sendEngagementInfoDialogToManager(payload, 'call', 'state', 'dialog');
    expect(sendDialogTryCatch)
      .toBeCalledTimes(1);
  });
});

describe('sendBusStopForm dialog', () => {
  it('should send dialog for bus stop', async (done) => {
    const payload = { channel: {}, team: {}, actions: [{ value: 2 }] };
    const busStageList = [{}];

    await DialogPrompts.sendBusStopForm(payload, busStageList);

    expect(sendDialogTryCatch).toBeCalled();
    done();
  });
});
