import ManagerNotifications from '../index';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import RouteRequestService from '../../../../../../services/RouteRequestService';
import { mockRouteRequestData } from '../../../../../../services/__mocks__';
import SlackNotifications from '../../../Notifications';
import bugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import { slackEventNames, SlackEvents } from '../../../../events/slackEvents';
import InteractivePrompts from '../../../InteractivePrompts';

const testErrorHandle = (fnHandle, ...args) => async () => {
  const sendNotification = jest.spyOn(SlackNotifications, 'sendNotification');
  jest.spyOn(bugsnagHelper, 'log');
  sendNotification.mockImplementation(() => { throw new Error('Dummy error'); });
  await fnHandle(...args);
  expect(bugsnagHelper.log.mock.calls[0][0].message).toEqual('Dummy error');
};

describe('Manager Route Request Notification Tests', () => {
  let respond;
  let routeRequestData;
  const data = { routeRequestId: mockRouteRequestData.id, teamId: 'AAAAAA' };

  beforeEach(() => {
    routeRequestData = { ...mockRouteRequestData, status: 'Confirmed' };
    respond = jest.fn();
    jest.spyOn(SlackNotifications, 'sendNotification')
      .mockResolvedValue();
    jest.spyOn(RouteRequestService, 'getRouteRequest')
      .mockResolvedValue(routeRequestData);
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken')
      .mockResolvedValue('token');
    jest.spyOn(SlackNotifications, 'getDMChannelId')
      .mockResolvedValue('token');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('handleStatusValidationError', () => {
    it('handleStatusValidationError should complete manager action', async () => {
      const payload = {
        channel: { id: 1 },
        team: { id: 1 },
        original_message: { ts: 'timestamp' }
      };
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken')
        .mockReturnValue('token');
      const completeManagerAction = jest.spyOn(ManagerNotifications, 'completeManagerAction')
        .mockReturnValue('token');
      await ManagerNotifications.handleStatusValidationError(payload, 'routeRequest');
      expect(completeManagerAction).toHaveBeenCalledTimes(1);
      expect(completeManagerAction).toHaveBeenCalledWith('routeRequest', 1, 'timestamp', 'token');
    });
  });
  describe('send manager notification', () => {
    it('should send manager notification attachment', async () => {
      await ManagerNotifications.sendManagerNotification(respond, data);
      expect(respond).not.toHaveBeenCalled();
    });
    it('should handle unexpected error', testErrorHandle(
      ManagerNotifications.sendManagerNotification, jest.fn(), data
    ));
  });
  describe('send manager decline notification', () => {
    it('should send manager decline attachment', async () => {
      routeRequestData = {
        ...mockRouteRequestData,
        status: 'Declined'
      };
      RouteRequestService.getRouteRequest
        .mockResolvedValue(routeRequestData);
      await ManagerNotifications.sendManagerDeclineMessageToFellow(data);
      expect(respond).not.toHaveBeenCalled();
    });
    it('should handle unexpected error', testErrorHandle(
      ManagerNotifications.sendManagerDeclineMessageToFellow, data
    ));
  });
  describe('send manager approval notification', () => {
    const payload = { team: { id: 1 } };
    it('should send notification attachment to ops and fellow ', async () => {
      jest.spyOn(SlackEvents, 'raise')
        .mockResolvedValue();
      jest.spyOn(bugsnagHelper, 'log');

      await ManagerNotifications.sendManagerApproval(payload, respond, data);

      expect(SlackEvents.raise.mock.calls[0][0])
        .toEqual(slackEventNames.RECEIVE_NEW_ROUTE_REQUEST);
      expect(bugsnagHelper.log).not.toHaveBeenCalled();
    });
    it('should handle unexpected error', testErrorHandle(
      ManagerNotifications.sendManagerApproval, payload, respond, data
    ));
  });
  describe('complete manager action', () => {
    const channelId = 'channelId';
    const timestamp = 'timestamp';
    const botToken = 'botToken';
    beforeEach(() => {
      jest.spyOn(InteractivePrompts, 'messageUpdate')
        .mockResolvedValue();
    });
    it('should complete decline action', async () => {
      routeRequestData = {
        ...mockRouteRequestData,
        status: 'Declined'
      };
      await ManagerNotifications.completeManagerAction(
        routeRequestData, channelId, timestamp, botToken
      );
      expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
    });
    it('should not complete decline/confirm action', async () => {
      routeRequestData = {
        ...mockRouteRequestData,
        status: 'Approved'
      };
      await ManagerNotifications.completeManagerAction(
        routeRequestData, channelId, timestamp, botToken
      );
      expect(InteractivePrompts.messageUpdate).not.toHaveBeenCalled();
    });
    it('should complete confirm action', async () => {
      await ManagerNotifications.completeManagerAction(
        routeRequestData, channelId, timestamp, botToken
      );
      expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
    });
    it('should handle unexpected error', async () => {
      InteractivePrompts.messageUpdate
        .mockRejectedValue(new Error('Dummy error'));
      jest.spyOn(bugsnagHelper, 'log');
      await ManagerNotifications.completeManagerAction(
        routeRequestData, channelId, timestamp, botToken
      );
      expect(bugsnagHelper.log.mock.calls[0][0].message).toEqual('Dummy error');
    });
  });
});
