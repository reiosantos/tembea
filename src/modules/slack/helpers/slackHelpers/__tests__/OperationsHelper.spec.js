import { mockRouteRequestData, routeData } from '../../../../../services/__mocks__';
import OperationsNotifications from '../../../SlackPrompts/notifications/OperationsRouteRequest';
import OperationsHelper from '../OperationsHelper';
import { cabService } from '../../../../../services/CabService';
import cache from '../../../../../cache';
import { tripInformation } from '../../../../trips/__tests__/__mocks__';
import SlackNotifications from '../../../SlackPrompts/Notifications';
import ProviderNotifications from '../../../SlackPrompts/notifications/ProviderNotifications';
import RouteNotifications from '../../../SlackPrompts/notifications/RouteNotifications';
import UserService from '../../../../../services/UserService';

describe('operations approve request', () => {
  let payload;
  let routeRequestId;
  let timeStamp;
  let channelId;

  beforeAll(() => {
    jest.spyOn(cache, 'fetch').mockResolvedValue(['12/01/2019', '12/12/2019', 'Saf']);
    payload = {
      submission: {
        declineReason: 'QQQQQQ', startDate: '31/01/2019', endDate: '20/02/2019'
      },
      actions: [{ name: 'action', value: '1' }],
      channel: { id: 1 },
      team: { id: 'TEAMID1' },
      original_message: { ts: 'timestamp' },
      user: { id: '4' }
    };
    ({ channel: { id: channelId }, original_message: { ts: timeStamp } } = payload);
    ({ id: routeRequestId } = mockRouteRequestData);

    const state = JSON.stringify({
      approve: {
        timeStamp, channelId, routeRequestId
      }
    });
    payload = {
      ...payload,
      submission: {
        routeName: 'QQQQQQ', takeOffTime: '12:30', cab: 'JDD3883, SDSAS, DDDDD'
      },
      callback_id: 'operations_route_approvedRequest',
      state
    };
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('get cab details if a new cab is created', async () => {
    payload.callback_id = 'operations_reason_dialog_route';
    payload.submission = {
      cab: 'Create New Cab',
      driverName: 'James',
      driverPhoneNo: 888288912981,
      regNumber: 'KCB 00P',
      capacity: 2,
      model: 'Toyota'
    };

    jest.spyOn(cabService, 'findOrCreateCab').mockResolvedValue({ data: {} });
    await OperationsHelper.getCabSubmissionDetails(payload, payload.submission);
    expect(cabService.findOrCreateCab).toBeCalled();
  });
});

describe('completeRouteApproval', () => {
  it('Should send notifications to the provider, ops, user and manager', async () => {
    const data = {
      channelId: 'QAZWSX',
      opsSlackId: 'WASASAS',
      timeStamp: '12345678987',
      submission: {
        providerId: 1
      },
      botToken: 'xaxsaxscascascs'
    };
    jest.spyOn(ProviderNotifications, 'sendRouteApprovalNotification').mockResolvedValue();
    jest.spyOn(OperationsNotifications, 'completeOperationsApprovedAction').mockResolvedValue();
    jest.spyOn(RouteNotifications, 'sendRouteApproveMessageToManager').mockResolvedValue();
    jest.spyOn(RouteNotifications, 'sendRouteApproveMessageToFellow').mockResolvedValue();
    jest.spyOn(UserService, 'updateUser').mockResolvedValue();

    await OperationsHelper.completeRouteApproval(mockRouteRequestData, routeData, data);
    expect(ProviderNotifications.sendRouteApprovalNotification)
      .toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Number),
        expect.any(String)
      );
    
    expect(OperationsNotifications.completeOperationsApprovedAction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(Object),
    );
    
    expect(RouteNotifications.sendRouteApproveMessageToFellow).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      expect.any(Object),
    );
    expect(RouteNotifications.sendRouteApproveMessageToManager).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      expect.any(Object),
    );

    expect(UserService.updateUser).toHaveBeenCalledWith(
      expect.any(Number), expect.any(Object),
    );
  });
});

describe('OperationsHelper', () => {
  describe('sendcompleteOpAssignCabMsg', () => {
    beforeEach(() => {
      jest.spyOn(SlackNotifications, 'sendUserConfirmOrDeclineNotification').mockResolvedValue();
      jest.spyOn(SlackNotifications, 'sendManagerConfirmOrDeclineNotification').mockResolvedValue();
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should send completion notifications', async () => {
      const ids = {
        requesterSlackId: 'requesterSlackId',
        riderSlackId: 'riderSlackId'
      };
      await OperationsHelper.sendcompleteOpAssignCabMsg('teamId', ids, {});
      const {
        sendUserConfirmOrDeclineNotification,
        sendManagerConfirmOrDeclineNotification
      } = SlackNotifications;
      expect(sendUserConfirmOrDeclineNotification).toBeCalledTimes(2);
      expect(sendManagerConfirmOrDeclineNotification).toBeCalledTimes(1);
    });
    it('should send completion notifications', async () => {
      const ids = {
        requesterSlackId: 'requesterSlackId',
        riderSlackId: 'requesterSlackId'
      };
      await OperationsHelper.sendcompleteOpAssignCabMsg('teamId', ids, {});
      const {
        sendUserConfirmOrDeclineNotification,
        sendManagerConfirmOrDeclineNotification
      } = SlackNotifications;
      expect(sendUserConfirmOrDeclineNotification).toBeCalledTimes(1);
      expect(sendManagerConfirmOrDeclineNotification).toBeCalledTimes(1);
    });
  });

  describe('getTripDetailsAttachment', () => {
    it('should return tripDetailsAttachment', () => {
      jest.spyOn(OperationsHelper, 'getTripDetailsAttachment');
      OperationsHelper.getTripDetailsAttachment(tripInformation, {});
      expect(OperationsHelper.getTripDetailsAttachment).toHaveReturned();
    });
  });
  describe('getTripDetailsAttachment', () => {
    const payload = {
      tripStatus: 'Confirmed',
      tripId: 'tripId',
      operationsComment: 'comment',
      confirmedById: 'opsUserId',
      approvalDate: 'timeStamp',
    };
    it('should return trioDetailsAttachment', () => {
      jest.spyOn(OperationsHelper, 'getUpdateTripStatusPayload');
      const statusPayload = OperationsHelper
        .getUpdateTripStatusPayload('tripId', 'comment', 'opsUserId', 'timeStamp');
      expect(OperationsHelper.getUpdateTripStatusPayload).toHaveReturned();
      expect(statusPayload).toEqual(payload);
    });
  });
});
