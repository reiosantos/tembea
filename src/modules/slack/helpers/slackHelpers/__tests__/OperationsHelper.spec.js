import RouteRequestService from '../../../../../services/RouteRequestService';
import { mockRouteRequestData, routeData } from '../../../../../services/__mocks__';
import OperationsNotifications from '../../../SlackPrompts/notifications/OperationsRouteRequest';
import OperationsHelper from '../OperationsHelper';
import { cabService } from '../../../../../services/CabService';
import cache from '../../../../../cache';
import { bugsnagHelper } from '../../../RouteManagement/rootFile';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import { providerService } from '../../../../../services/ProviderService';
import UserService from '../../../../../services/UserService';
import { providerMock, tripInformation } from '../../../../trips/__tests__/__mocks__';
import BugsnagHelper from '../../../../../helpers/bugsnagHelper';
import SlackNotifications from '../../../SlackPrompts/Notifications';

describe('operations approve request', () => {
  let payload;
  let getRouteRequestAndToken;
  let completeOperationsApprovedAction;
  let updateRouteRequest;
  let routeRequestId;
  let timeStamp;
  let channelId;

  beforeAll(() => {
    jest.spyOn(cache, 'fetch').mockResolvedValue(['12/01/2019', '12/12/2019', 'Saf']);
    getRouteRequestAndToken = jest.spyOn(RouteRequestService, 'getRouteRequestAndToken');
    updateRouteRequest = jest.spyOn(RouteRequestService, 'updateRouteRequest');
    completeOperationsApprovedAction = jest.spyOn(
      OperationsNotifications, 'completeOperationsApprovedAction'
    );
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
  it('should throw an error if route request is not updated', async () => {
    getRouteRequestAndToken.mockResolvedValue(
      { routeRequest: { }, slackBotOauthToken: 'dfdf' }
    );
    updateRouteRequest.mockRejectedValue(new Error('failed'));
    jest.spyOn(bugsnagHelper, 'log');
    await OperationsHelper.sendOpsData(payload);
    expect(bugsnagHelper.log).toHaveBeenCalled();
    completeOperationsApprovedAction.mockReturnValue('Token');
  });

  it('should get botToken', async () => {
    const requestData = { teamUrl: 'adaeze.slackcom' };
    jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue({
      botToken: 'xoop'
    });
    const slackbotToken = await OperationsHelper.getBotToken(requestData.teamUrl);
    expect(slackbotToken).toEqual('xoop');
  });
});

describe('sendOpsData', () => {
  it('Should send operations data', async () => {
    const data = {
      team: { id: 'UUXXID' },
      user: { id: 'CUXJC' },
      submission: { Provider: '1,UberKenya,15', routeName: 'bayArea' },
      state: '{"approve": {"channelId":"UJCSK", "timeStamp":"12345678987","routeRequestId":"1", "confirmationComment":"all good"}}'
    };
    jest.spyOn(providerService, 'getProviderById').mockResolvedValue(providerMock);
    jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue({ id: 1 });
    jest.spyOn(RouteRequestService, 'getRouteRequestAndToken').mockResolvedValue({
      slackBotOauthToken: 'xoop', routeRequest: routeData
    });
    jest.spyOn(RouteRequestService, 'updateRouteRequest').mockResolvedValue(routeData);
    jest.spyOn(OperationsNotifications, 'completeOperationsRouteApproval').mockResolvedValue();
    await OperationsHelper.sendOpsData(data);
    expect(RouteRequestService.getRouteRequestAndToken).toHaveBeenCalledWith(
      '1', 'UUXXID'
    );
    expect(providerService.getProviderById).toHaveBeenCalledWith('1');
    expect(UserService.getUserBySlackId).toHaveBeenCalledWith('CUXJC');
    expect(OperationsNotifications.completeOperationsRouteApproval).toHaveBeenCalled();
  });
  it('should catch all errors if invalid or no parameters are provided', async () => {
    jest.spyOn(BugsnagHelper, 'log');
    await OperationsHelper.sendOpsData();
    expect(BugsnagHelper.log).toHaveBeenCalled();
  });
});

describe('OprationsHelper', () => {
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
