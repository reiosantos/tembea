import SlackNotifications from '../../../Notifications';
import { mockRouteRequestData } from '../../../../../../services/__mocks__';
import OperationsNotifications from '..';
import InteractivePrompts from '../../../InteractivePrompts';
import bugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import RouteRequestService from '../../../../../../services/RouteRequestService';
import TeamDetailsService from '../../../../../../services/TeamDetailsService';
import OpsAttachmentHelper from '../helper';
import AttachmentHelper from '../../ManagerRouteRequest/helper';
import Cache from '../../../../../../cache';

describe('OperationsNotifications', () => {
  const submission = {
    routeName: 'Yaba',
    routeCapacity: 12,
    takeOffTime: '12:30',
    regNumber: 'JKEO284'
  };
  const botToken = 'XXXXXX';
  let requestData;
  beforeEach(() => {
    jest.spyOn(Cache, 'fetch').mockResolvedValue(
      ['12/01/2019', '12/12/2022', 'Safaricom']
    );
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue({});
    jest.spyOn(OpsAttachmentHelper, 'getFellowApproveAttachment');
    jest.spyOn(OpsAttachmentHelper, 'getManagerApproveAttachment');
    jest.spyOn(OpsAttachmentHelper, 'getOperationCompleteAttachment');
    jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue({});
    jest.spyOn(SlackNotifications, 'sendNotification').mockReturnValue({});
    jest.spyOn(bugsnagHelper, 'log');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('completeOperationsApproveActions', () => {
    const channelId = 'channelId';
    const timestamp = 'timestamp';
    const opsId = 'XXXXXX';
    jest.spyOn(OperationsNotifications, 'sendOpsApproveMessageToFellow').mockResolvedValue({});
    jest.spyOn(OperationsNotifications, 'sendOpsApproveMessageToManager').mockResolvedValue({});
    it('should complete the approve new route action', async (done) => {
      requestData = {
        ...mockRouteRequestData,
        status: 'Approved',
      };
      await OperationsNotifications.completeOperationsApprovedAction(
        requestData, channelId, timestamp, opsId, botToken, submission
      );
      expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
      expect(OperationsNotifications.sendOpsApproveMessageToFellow).toHaveBeenCalled();
      expect(OperationsNotifications.sendOpsApproveMessageToManager).toHaveBeenCalled();
      expect(OpsAttachmentHelper.getOperationCompleteAttachment).toHaveBeenCalled();
      done();
    });
  });

  describe('sendOpsApprovedMessageToFellow', () => {
    beforeEach(() => {
      requestData = {
        ...mockRouteRequestData,
        status: 'Approved',
      };
    });
    it('should send  ops approve notification to fellow', async () => {
      await OperationsNotifications.sendOpsApproveMessageToFellow(
        requestData, botToken, submission
      );
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalledTimes(1);
      expect(OpsAttachmentHelper.getFellowApproveAttachment).toHaveBeenCalledTimes(1);
      expect(SlackNotifications.sendNotification).toHaveBeenCalled();
    });

    it('should catch errors', async (done) => {
      jest.spyOn(OpsAttachmentHelper, 'getFellowApproveAttachment')
        .mockRejectedValue('an error');
      await OperationsNotifications.sendOpsApproveMessageToFellow(
        requestData, botToken, submission
      );
      expect(bugsnagHelper.log).toHaveBeenCalled();
      done();
    });
  });

  describe('sendOpsApprovedMessageToManager', () => {
    beforeEach(() => {
      requestData = {
        ...mockRouteRequestData,
        status: 'Approved',
      };
    });
    it('should send ops approve notification to manager', async (done) => {
      await OperationsNotifications.sendOpsApproveMessageToManager(
        requestData, botToken, submission
      );
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
      expect(OpsAttachmentHelper.getManagerApproveAttachment).toHaveBeenCalled();
      expect(SlackNotifications.sendNotification).toHaveBeenCalled();

      done();
    });

    it('should catch errors', async (done) => {
      SlackNotifications.getDMChannelId
        .mockRejectedValue(new Error('Failed'));
      await OperationsNotifications.sendOpsApproveMessageToManager(
        requestData, botToken, submission
      );
      expect(bugsnagHelper.log.mock.calls[0][0].message).toEqual('Failed');
      done();
    });
  });
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
    jest.spyOn(AttachmentHelper, 'getManagerCompleteAttachment');
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
      expect(AttachmentHelper.getManagerCompleteAttachment).toHaveBeenCalled();
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
