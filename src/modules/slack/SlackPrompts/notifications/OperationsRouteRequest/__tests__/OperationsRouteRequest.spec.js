import SlackNotifications from '../../../Notifications';
import { mockRouteRequestData } from '../../../../../../services/__mocks__';
import OperationsNotifications from '..';
import InteractivePrompts from '../../../InteractivePrompts';
import bugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import RouteRequestService from '../../../../../../services/RouteRequestService';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import OpsAttachmentHelper from '../helper';
import Cache from '../../../../../../cache';
import ManagerAttachmentHelper from '../../ManagerRouteRequest/helper';
import { routeData } from '../../../../RouteManagement/__mocks__/providersController.mock';
import { routeRequestData, opsData } from '../__mocks__/OpsRouteRequest.mock';
import ProvidersController from '../../../../RouteManagement/ProvidersController';
import RouteNotifications from '../../RouteNotifications';
import ProviderNotifications from '../../ProviderNotifications';


describe('OperationsNotifications', () => {
  beforeEach(() => {
    jest.spyOn(Cache, 'fetch').mockResolvedValue(
      ['12/01/2019', '12/12/2022', 'Safaricom']
    );
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
    jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue({});
    jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
    jest.spyOn(bugsnagHelper, 'log');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('OperationsNotifications', () => {
    const data = { routeRequestId: mockRouteRequestData.id, teamId: 'AFJEV' };
    let requestData;
    beforeEach(() => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue({ botToken: 'XXXX' });
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
      jest.spyOn(OpsAttachmentHelper, 'getOperationDeclineAttachment').mockResolvedValue({});
      jest.spyOn(OpsAttachmentHelper, 'getOperationCompleteAttachment').mockResolvedValue({});
      jest.spyOn(ManagerAttachmentHelper, 'getManagerCompleteAttachment');
      jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
      jest.spyOn(bugsnagHelper, 'log');
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    describe('sendOpsDeclineMessageToFellow', () => {
      it('should send ops decline notification to fellow', async () => {
        requestData = {
          id: 12,
          status: 'Declined',
          managerComment: 'ZZZZZZZ',
          opsComment: 'XXXXXX',
          routeImageUrl: 'Pending',
          distance: 3.02,
          busStopDistance: 1.02,
          engagement: { fellow: { slackId: '345qq' } },
          manager: { slackId: '345qq' }
        };

        jest.spyOn(RouteRequestService, 'getRouteRequest').mockResolvedValue(requestData);
        await OperationsNotifications.sendOpsDeclineMessageToFellow(1, '', 'andela-tembea.slack.com');
        expect(RouteRequestService.getRouteRequest).toHaveBeenCalled();
        expect(TeamDetailsService.getTeamDetailsByTeamUrl).toHaveBeenCalled();
        expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
        expect(OpsAttachmentHelper.getOperationDeclineAttachment).toHaveBeenCalledTimes(2);
        expect(SlackNotifications.sendNotification).toHaveBeenCalled();
      });

      it('should catch errors', async () => {
        jest.spyOn(RouteRequestService, 'getRouteRequest')
          .mockRejectedValue(new Error('Failed'));
        await OperationsNotifications.sendOpsDeclineMessageToFellow(data);
        expect(bugsnagHelper.log.mock.calls[0][0].message).toEqual('Failed');
      });
    });

    describe('completeOperationsActions', () => {
      const channelId = 'channelId';
      const timestamp = 'timestamp';
      const botToken = 'botToken';


      beforeEach(() => {
        jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue();
        jest.spyOn(OperationsNotifications, 'sendOpsDeclineMessageToFellow').mockResolvedValue({});
      });
      afterEach(() => {
        jest.resetAllMocks();
      });
      it('should complete the decline new route action', async () => {
        requestData = {
          ...mockRouteRequestData,
          status: 'Declined',
          opsComment: 'no route'

        };
        const payload = {
          user: {
            id: 1
          }
        };
        jest.spyOn(Cache, 'fetch').mockResolvedValue(
          ['12/01/2019', '12/12/2022', 'Safaricom']
        );
        await OperationsNotifications.completeOperationsDeclineAction(
          requestData, channelId, data.teamId, data.routeRequestId, timestamp, botToken,
          payload
        );
        expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
        expect(OperationsNotifications.sendOpsDeclineMessageToFellow).toHaveBeenCalled();
        expect(ManagerAttachmentHelper.getManagerCompleteAttachment).toHaveBeenCalled();
      });

      it('should complete approve new route action', async () => {
        requestData = {
          ...mockRouteRequestData,
          status: 'Approved',
          opsComment: 'okay'
        };

        const submission = { routeName: 'the dojo', takeOff: '10:00' };
        await OperationsNotifications
          .completeOperationsApprovedAction(requestData, channelId, timestamp, 1, botToken, submission, false);

        expect(OpsAttachmentHelper.getOperationCompleteAttachment).toHaveBeenCalled();
      });

      it('should send ops update approve notification', async () => {
        requestData = {
          ...mockRouteRequestData,
          status: 'Approved',
          opsComment: 'okay',
          opsReviewer: { slackId: 'abc123' }
        };

        const payload = {
          channel: channelId,
          team: 1,
          message_ts: timestamp,
          actions: []
        };
        jest.spyOn(OperationsNotifications, 'completeOperationsApprovedAction');

        await OperationsNotifications
          .updateOpsStatusNotificationMessage(payload, requestData, botToken);
        expect(OperationsNotifications.completeOperationsApprovedAction).toHaveBeenCalled();
      });

      it('should send ops update decline notification', async () => {
        requestData = {
          ...mockRouteRequestData,
          status: 'Declined',
          opsComment: 'not okay',
          opsReviewer: { slackId: 'abc123' }
        };

        const payload = {
          channel: channelId,
          team: 1,
          message_ts: timestamp,
          actions: [{ action: 'random action' }]
        };
        jest.spyOn(OperationsNotifications, 'completeOperationsDeclineAction');

        await OperationsNotifications
          .updateOpsStatusNotificationMessage(payload, requestData, botToken);
        expect(OperationsNotifications.completeOperationsDeclineAction).toHaveBeenCalled();
      });

      it('should handle errors', async () => {
        await OperationsNotifications.completeOperationsDeclineAction();
        jest.spyOn(bugsnagHelper, 'log');
        expect(bugsnagHelper.log).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('completeOperationsRouteApproval', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('Should handle operations route approval', async () => {
      jest.spyOn(ProvidersController, 'saveRoute').mockResolvedValue(routeData);
      jest.spyOn(RouteNotifications, 'sendRouteApproveMessageToManager').mockResolvedValue();
      jest.spyOn(RouteNotifications, 'sendRouteApproveMessageToFellow').mockResolvedValue();
      jest.spyOn(ProviderNotifications, 'sendRouteApprovalNotification').mockResolvedValue();
      jest.spyOn(OperationsNotifications, 'completeOperationsApprovedAction').mockResolvedValue();
      await OperationsNotifications.completeOperationsRouteApproval(
        routeData, routeRequestData, opsData
      );
      expect(RouteNotifications.sendRouteApproveMessageToManager).toHaveBeenCalledWith(
        routeData, opsData.botToken, routeRequestData
      );
      expect(RouteNotifications.sendRouteApproveMessageToFellow).toHaveBeenCalledWith(
        routeData, opsData.botToken, routeRequestData
      );
      expect(ProviderNotifications.sendRouteApprovalNotification).toHaveBeenCalledWith(
        routeData, routeRequestData.provider, opsData.botToken
      );
      expect(OperationsNotifications.completeOperationsApprovedAction).toHaveBeenCalledWith(
        routeData,
        opsData.channelId, opsData.timeStamp, opsData.opsId, opsData.botToken, routeRequestData
      );
    });
  });
});
