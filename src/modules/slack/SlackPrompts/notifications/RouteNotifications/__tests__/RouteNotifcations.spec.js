import RouteNotifications from '../index';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import SlackNotifications from '../../../Notifications';

describe('Route Notifications', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('Send InactiveRoute Notification To RouteRiders', () => {
    it('should call the methods to create and send notification to all the riders', async () => {
      const routeInfo = {
        riders: [
          { slackId: 1 },
          { slackId: 2 },
          { slackId: 3 }
        ],
        route: { destination: { address: 'Epic Tower' } }
      };
      const teamUrl = 'go@slack.com';
      const teamDetailsMock = jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
        .mockResolvedValue({ botToken: 'xxxx-123' });
      const createMessageMock = jest.spyOn(SlackNotifications, 'createDirectMessage')
        .mockReturnValue('Good to go');
      const sendNotifyMock = jest.spyOn(RouteNotifications, 'sendNotificationToRider')
        .mockImplementation();
      const text = 'Sorry, Your route to *Epic Tower* is no longer available :disappointed:';

      await RouteNotifications.sendRouteNotificationToRouteRiders(teamUrl, routeInfo);
      expect(teamDetailsMock).toHaveBeenCalledTimes(1);
      expect(teamDetailsMock).toHaveBeenCalledWith(teamUrl);
      expect(createMessageMock).toHaveBeenCalledTimes(1);
      expect(createMessageMock).toHaveBeenCalledWith('', text);
      expect(sendNotifyMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Send notification to rider', () => {
    it('should call methods to get dmId and sendNotification', async () => {
      const imIdMock = jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue(1);
      const slackNotificationMock = jest.spyOn(SlackNotifications, 'sendNotification')
        .mockImplementation();
      const message = { id: 1 };

      await RouteNotifications.sendNotificationToRider(message, 12, 'token');
      expect(imIdMock).toHaveBeenCalledTimes(1);
      expect(imIdMock).toHaveBeenCalledWith(12, 'token');
      expect(slackNotificationMock).toHaveBeenCalledWith({ channel: 1, id: 1 }, 'token');
    });
  });
});
