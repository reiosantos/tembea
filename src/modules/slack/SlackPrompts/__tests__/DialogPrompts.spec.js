import TeamDetailsService from '../../../../services/TeamDetailsService';
import DialogPrompts from '../DialogPrompts';
import sendDialogTryCatch from '../../../../helpers/sendDialogTryCatch';
import UserService from '../../../../services/UserService';
import { driverService } from '../../../../services/DriverService';
import { cabService } from '../../../../services/CabService';
import ProviderService, { providerService } from '../../../../services/ProviderService';
import ProviderHelper from '../../../../helpers/providerHelper';
import HomebaseService from '../../../../services/HomebaseService';

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

const respond = jest.fn();

describe('Dialog prompts test', () => {
  beforeEach(() => {
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('token');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should test sendTripDetailsForm function', async () => {
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripDetailsForm(payload, 'someFunctionName', 'someCallbackId');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should test sendSkipPage function', async () => {
    const payload = { actions: [{ name: 'skipPage' }], team: { id: 'TEAMID1' } };
    await DialogPrompts.sendSkipPage(payload, 'view_upcoming_trips');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should test sendRescheduleTripForm function', async () => {
    const payload = { callback_id: 'calling', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendRescheduleTripForm(payload, 'call', 'state', 'dialog');
    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should test sendTripReasonForm function', async () => {
    const payload = { trigger_id: 'trigger', team: { id: 'TEAMID1' } };
    await DialogPrompts.sendTripReasonForm(payload);
    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should test sendCommentDialog function', async () => {
    await DialogPrompts.sendOperationsDeclineDialog({
      message_ts: 'trigger',
      actions: ['value', ''],
      team: { id: 'TEAMID1' }
    });
    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should test sendOperationsApprovalDialog function', async () => {
    await DialogPrompts.sendOperationsApprovalDialog({
      actions: [{
        value: JSON.stringify({ confirmationComment: 'comment' })
      }, ''],
      trigger_id: 'trigger',
      channel: {
        id: 'XXXXXXXX'
      },
      team: { id: 'TEAMID1' }
    }, respond);

    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should test sendOperationsApprovalDialog function on create new cab', async () => {
    await DialogPrompts.sendOperationsApprovalDialog({
      actions: [{
        value: JSON.stringify({ confirmationComment: 'comment' })
      }, ''],
      callback_id: 'operations_approval_route',
      trigger_id: 'trigger',
      channel: {
        id: 'XXXXXXXX'
      },
      team: { id: 'TEAMID1' }
    }, respond);
    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should send decline dialog', async () => {
    await DialogPrompts.sendReasonDialog({
      trigger_id: 'XXXXXXX',
      team: { id: 'TEAMID1' }
    },
    'callback_id',
    'state',
    'dialogName');

    expect(sendDialogTryCatch).toBeCalled();
  });

  it('should test sendLocationForm function', async () => {
    await DialogPrompts.sendLocationForm({
      actions: ['value', ''],
      trigger_id: 'trigger',
      channel: {
        id: 'XXXXX'
      },
      team: { id: 'TEAMID1' }
    });

    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should sendLocationCoordinatesForm', async () => {
    await DialogPrompts.sendLocationCoordinatesForm({
      trigger_id: 'XXXXXXX',
      team: { id: 'TEAMID1' }
    });

    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });

  it('should send sendOperationsNewRouteApprovalDialog dialog', async () => {
    const state = JSON.stringify({
      approve: {
        timeStamp: '123848', channelId: 'XXXXXX', routeRequestId: '1'
      }
    });
    jest.spyOn(ProviderService, 'getViableProviders').mockResolvedValue(
      [{
        name: 'label',
        providerUserId: 1,
        user: { slackId: 'DDD' }
      }]
    );
    await DialogPrompts.sendOperationsNewRouteApprovalDialog({
      trigger_id: 'XXXXXXX',
      team: { id: 'TEAMID1' }
    }, state);

    expect(sendDialogTryCatch).toBeCalledTimes(1);
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

  it('should test sendSearchPage function', async () => {
    const payload = { actions: [{ name: 'search' }], team: { id: 'TEAMID1' } };
    await DialogPrompts.sendSearchPage(payload, 'view_available_routes', 'tembea-route', respond);
    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });
  it('should send select cab dialog', async () => {
    const driver = {
      data: [{
        id: 2,
        driverName: 'good',
        driverPhoneNo: '09090999090',
        driverNumber: '909909',
        providerId: 1
      }]
    };
    const cab = {
      data: [{
        model: 'doodle',
        regNumber: '990ccc',
        capacity: 4
      }]
    };
    jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue({});
    jest.spyOn(providerService, 'findProviderByUserId').mockResolvedValue({});
    jest.spyOn(cabService, 'getCabs').mockResolvedValue(cab);
    jest.spyOn(driverService, 'getPaginatedItems').mockResolvedValue(driver);

    await DialogPrompts.sendSelectCabDialog({
      actions: [{ value: 7 }],
      message_ts: '3703484984.4849',
      channel: { id: 84 },
      team: { id: 9 },
      user: { id: 'uxclla' }
    });

    expect(sendDialogTryCatch).toBeCalledTimes(1);
  });
});

describe('sendBusStopForm dialog', () => {
  it('should send dialog for bus stop', async () => {
    const payload = { channel: {}, team: {}, actions: [{ value: 2 }] };
    const busStageList = [{}];

    await DialogPrompts.sendBusStopForm(payload, busStageList);

    expect(sendDialogTryCatch).toBeCalled();
  });
  describe('DialogPrompts_sendNewRouteForm', () => {
    it('should lunch new route form', async () => {
      const payload = { team: { id: '123' } };
      await DialogPrompts.sendNewRouteForm(payload);
      expect(sendDialogTryCatch).toBeCalled();
    });
  });
  describe('sendTripNotesDialogForm', () => {
    it('should send trip notes form dialog', async () => {
      const payload = { submission: {}, team: { id: 'TEAMID1' } };
      await DialogPrompts.sendTripNotesDialogForm(payload);
      expect(sendDialogTryCatch).toBeCalled();
    });
  });

  describe('sendLocationDialogToUser', () => {
    it('should send resubmit location dialog to user', async () => {
      await DialogPrompts.sendLocationDialogToUser({
        actions: [{
          value: 'no_Pick up'
        }],
        trigger_id: 'XXXXXXX',
        team: { id: 'TEAMID1' }
      });

      expect(sendDialogTryCatch).toHaveBeenCalled();
    });
  });
  describe('DialogPrompts > sendSelectProviderDialog', () => {
    it('should send select provider dialog', async () => {
      jest.spyOn(ProviderService, 'getViableProviders').mockResolvedValue(
        [{
          name: 'label',
          providerUserId: 1,
          user: { slackId: 'DDD' }
        }]
      );
      jest.spyOn(ProviderHelper, 'generateProvidersLabel');
      jest.spyOn(UserService, 'getUserBySlackId').mockImplementation(() => ({ id: 1 }));
      jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockImplementation(() => ([{ id: 1 }]));
      await DialogPrompts.sendSelectProviderDialog({
        actions: [{ value: 7 }],
        message_ts: '3703484984.4849',
        channel: { id: 84 },
        team: { id: 9 },
        user: { id: 1 }
      });
      expect(sendDialogTryCatch).toHaveBeenCalled();
    });
  });
});
