import RouteNotifications from '../index';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import SlackNotifications from '../../../Notifications';
import RouteService from '../../../../../../services/RouteService';
import UserService from '../../../../../../services/UserService';
import BugsnagHelper from '../../../../../../helpers/bugsnagHelper';

import { routeRequestData } from '../../OperationsRouteRequest/__mocks__/OpsRouteRequest.mock';
import ProviderAttachmentHelper from '../../ProviderNotifications/helper';
import { routeBatch } from '../../../../../../helpers/__mocks__/routeMock';
import { mockRecord } from '../../../../../../services/__mocks__';

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
      const getDMSpy = jest.spyOn(SlackNotifications, 'getDMChannelId')
        .mockResolvedValue('TEAMID12');
      const routeServiceSpy = jest.spyOn(RouteService, 'getRouteBatchByPk')
        .mockResolvedValue(routeBatch);
      const createMessageSpy = jest.spyOn(SlackNotifications, 'createDirectMessage')
        .mockImplementation(() => ({ channel: 'TEAMX', text: 'message', attachments: [] }));
      const notificationSpy = jest.spyOn(SlackNotifications, 'sendNotification')
        .mockResolvedValue();

      const data = {
        record: mockRecord[0], rider: { slackId: 'ASWEQEW' }
      };
      await RouteNotifications.sendRouteUseConfirmationNotificationToRider(
        data, 'xoop-ewrwere'
      );

      expect(getDMSpy).toHaveBeenCalledTimes(1);
      expect(createMessageSpy).toHaveBeenCalledTimes(1);
      expect(routeServiceSpy).toHaveBeenCalledTimes(1);
      expect(notificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should catch errors when sending route use confirmation to rider', async () => {
      const getDMSpy = jest.spyOn(SlackNotifications, 'getDMChannelId')
        .mockRejectedValue('');
      const errorSpy = jest.spyOn(BugsnagHelper, 'log');

      await RouteNotifications.sendRouteUseConfirmationNotificationToRider(
        { recordId: 3, rider: { slackId: '78uu' } }, 'xoop-ewrwere'
      );

      expect(getDMSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendRouteApproveMessageToManager', () => {
    it('Should get manager approve attachment', async () => {
      const routeRequest = { manager: { slackId: 'UCCUXP' } };
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('xxid');
      jest.spyOn(ProviderAttachmentHelper, 'getManagerApproveAttachment').mockResolvedValue({});
      jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
      await RouteNotifications.sendRouteApproveMessageToManager(routeRequest, 'xoop', routeRequestData);
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
    });
    it('should catch all errors if invalid or no parameters are provided', async () => {
      jest.spyOn(BugsnagHelper, 'log');
      await RouteNotifications.sendRouteApproveMessageToManager();
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });
  });
  describe('sendRouteApproveMessageToFellow', () => {
    it('Should get fellow approve attachment', async () => {
      const routeRequest = { engagement: { fellow: { slackId: 'UCCUXP' } } };
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('xxid');
      jest.spyOn(ProviderAttachmentHelper, 'getFellowApproveAttachment').mockResolvedValue({});
      jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
      await RouteNotifications.sendRouteApproveMessageToFellow(routeRequest, 'xoop', routeRequestData);
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
      expect(ProviderAttachmentHelper.getFellowApproveAttachment).toHaveBeenCalled();
      expect(SlackNotifications.sendNotification).toHaveBeenCalled();
    });
    it('should catch all errors if invalid or no parameters are provided', async () => {
      jest.spyOn(BugsnagHelper, 'log');
      await RouteNotifications.sendRouteApproveMessageToFellow();
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });
  });

  describe('sendRouteTripReminder', () => {
    const data = {
      rider: {
        slackId: 'AABBCCDD'
      },
      batch: routeBatch
    };
    const botToken = 'xoop-sdad';

    it('should send route trip reminder message to user', async () => {
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('TEAMID12');
      jest.spyOn(SlackNotifications, 'createDirectMessage');
      jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
      await RouteNotifications.sendRouteTripReminder(data, botToken);
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalledWith(
        expect.any(String), expect.any(String)
      );
      expect(SlackNotifications.createDirectMessage).toHaveBeenCalledWith(
        expect.any(String), expect.any(String), expect.any(Object)
      );
    });
    
    it('should catch and log errors', async () => {
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockRejectedValue(new Error('Error'));
      jest.spyOn(BugsnagHelper, 'log');
      await RouteNotifications.sendRouteTripReminder(data, botToken);
      expect(BugsnagHelper.log).toHaveBeenCalledWith(
        expect.any(Error)
      );
    });
  });
});
