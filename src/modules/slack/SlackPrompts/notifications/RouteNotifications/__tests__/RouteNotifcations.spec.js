import RouteNotifications from '../index';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import SlackNotifications from '../../../Notifications';
import RouteService from '../../../../../../services/RouteService';
import UserService from '../../../../../../services/UserService';
import BugsnagHelper from '../../../../../../helpers/bugsnagHelper';

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
        route: { destination: { address: 'Epic Tower' } },
        status: 'Inactive'
      };
      const teamUrl = 'go@slack.com';
      const teamDetailsMock = jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
        .mockResolvedValue({ botToken: 'xxxx-123' });
      const createMessageMock = jest.spyOn(SlackNotifications, 'createDirectMessage')
        .mockReturnValue('Good to go');
      const sendNotifyMock = jest.spyOn(RouteNotifications, 'nofityRouteUsers')
        .mockImplementation();
      jest.spyOn(RouteService, 'getRouteBatchByPk').mockResolvedValue(null);
      const text = 'Sorry, Your route to *Epic Tower* is no longer available :disappointed:';

      await RouteNotifications.sendRouteNotificationToRouteRiders(teamUrl, routeInfo);
      expect(teamDetailsMock).toHaveBeenCalledTimes(1);
      expect(teamDetailsMock).toHaveBeenCalledWith(teamUrl);
      expect(createMessageMock).toHaveBeenCalledTimes(1);
      expect(createMessageMock).toHaveBeenCalledWith('', text, false);
      expect(sendNotifyMock).toHaveBeenCalledTimes(1);
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

  describe('generateRouteUpdateAttachement', () => {
    const updatedDetailsMock = {
      takeOff: '02:00',
      name: 'a route',
      destination: 'new destination',
      driverName: 'Fine Driver',
      driverPhoneNo: '01820284822'
    };

    it('should generate a new slack attachment object', () => {
      const result = RouteNotifications.generateRouteUpdateAttachement(updatedDetailsMock);
      expect(typeof result).toEqual('object');
      expect(Array.isArray(result.fields)).toBeTruthy();
      expect(result.fields.length).toEqual(5);
    });
  });

  describe('nofityRouteUsers', () => {
    const ridersMock = [
      { slackId: 1, id: 1 },
      { slackId: 2, id: 2 },
      { slackId: 3, id: 3 }
    ];
    const botToken = 'xxxx';
    const message = 'route updated';

    it('should send route update notification to all riders', async () => {
      const spy = jest.spyOn(RouteNotifications, 'sendNotificationToRider').mockImplementation();
      await RouteNotifications.nofityRouteUsers(ridersMock, message, false, botToken);
      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenLastCalledWith(message, ridersMock[2].slackId, botToken);
    });

    it('should send notification and remove riders upon route deactivation/deletion', async () => {
      jest.spyOn(RouteNotifications, 'sendNotificationToRider').mockImplementation();
      const userMock = { id: 1, routeBatchId: 10, save: jest.fn() };
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(userMock);
      await RouteNotifications.nofityRouteUsers([{ slackId: 1, id: 10 }], message, true, botToken);
      expect(UserService.getUserById).toHaveBeenCalledTimes(1);
      expect(UserService.getUserById).toHaveBeenLastCalledWith(10);
    });

    it('should catch all errors', async () => {
      jest.spyOn(BugsnagHelper, 'log');
      await RouteNotifications.nofityRouteUsers('', message, false, botToken);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });
  });
  describe('sendRouteUseConfirmationNotificationToRider', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should send route update notification to all riders', async () => {
      const spy = jest.spyOn(RouteService, 'getRouteBatchByPk')
        .mockResolvedValue({
          batch: '',
          takeOff: '',
          route: { name: '' },
          cabDetails: { regNumber: '', driverName: '', driverPhoneNo: '' },
        });
      const spy2 = jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('9999');
      jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue('9999');

      await RouteNotifications.sendRouteUseConfirmationNotificationToRider(
        { id: 3, user: { slackId: '78uu' }, routeUseRecord: { batch: { batchId: 1 } } }
      );

      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
