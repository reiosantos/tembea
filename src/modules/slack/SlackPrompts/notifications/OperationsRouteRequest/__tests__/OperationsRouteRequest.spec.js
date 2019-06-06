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
      requestData = { ...mockRouteRequestData, status: 'Confirmed' };
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockResolvedValue(requestData);
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue({});
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
      jest.spyOn(OpsAttachmentHelper, 'getOperationDeclineAttachment');
      jest.spyOn(ManagerAttachmentHelper, 'getManagerCompleteAttachment');
      jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
      jest.spyOn(bugsnagHelper, 'log');
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    describe('sendOpsDeclineMessageToFellow', () => {
      it('should send ops decline notification to fellow', async (done) => {
        // should change to ops comment
        beforeEach(() => {
          requestData = {
            ...mockRouteRequestData,
            status: 'Declined',
            opsComment: 'no route'

          };
        });
        RouteRequestService.getRouteRequest.mockResolvedValue(requestData);
        await OperationsNotifications.sendOpsDeclineMessageToFellow(data, 'TEMBEA');
        expect(RouteRequestService.getRouteRequest).toHaveBeenCalled();
        expect(TeamDetailsService.getTeamDetailsBotOauthToken).toHaveBeenCalled();
        expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
        expect(OpsAttachmentHelper.getOperationDeclineAttachment).toHaveBeenCalledTimes(2);
        expect(SlackNotifications.sendNotification).toHaveBeenCalled();
        done();
      });

      it('should catch errors', async (done) => {
        RouteRequestService.getRouteRequest
          .mockRejectedValue(new Error('Failed'));
        await OperationsNotifications.sendOpsDeclineMessageToFellow(data);
        expect(bugsnagHelper.log.mock.calls[0][0].message).toEqual('Failed');
        done();
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
      it('should complete the decline new route action', async (done) => {
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
        done();
      });
      it('should handle errors', async (done) => {
        await OperationsNotifications.completeOperationsDeclineAction();
        jest.spyOn(bugsnagHelper, 'log');
        expect(bugsnagHelper.log).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
