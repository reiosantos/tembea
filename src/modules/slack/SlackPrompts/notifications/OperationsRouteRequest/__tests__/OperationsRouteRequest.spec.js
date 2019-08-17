import SlackNotifications from '../../../Notifications';
import { mockRouteRequestData } from '../../../../../../services/__mocks__';
import InteractivePrompts from '../../../InteractivePrompts';
import bugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import OpsAttachmentHelper from '../helper';
import Cache from '../../../../../../cache';
import ManagerAttachmentHelper from '../../ManagerRouteRequest/helper';
import OperationsNotifications from '../index';

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
    let dmSpy;
    let requestData;
    beforeEach(() => {
      dmSpy = jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('WESRTE');
      jest.spyOn(OpsAttachmentHelper, 'getOperationDeclineAttachment');
      jest.spyOn(OpsAttachmentHelper, 'getOperationCompleteAttachment');
      jest.spyOn(ManagerAttachmentHelper, 'getManagerCompleteAttachment');
      jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
      jest.spyOn(bugsnagHelper, 'log');
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    describe('sendOpsDeclineMessageToFellow', () => {
      const botToken = 'xxop-asdaw';
      it('should send ops decline notification to fellow', async (done) => {
        await OperationsNotifications.sendOpsDeclineMessageToFellow(mockRouteRequestData, botToken);
        expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
        expect(OpsAttachmentHelper.getOperationDeclineAttachment).toHaveBeenCalledTimes(1);
        expect(SlackNotifications.sendNotification).toHaveBeenCalled();
        done();
      });

      it('should catch errors', async (done) => {
        dmSpy.mockRejectedValue(new Error('Channel not found'));
        await OperationsNotifications.sendOpsDeclineMessageToFellow([]);
        expect(bugsnagHelper.log).toHaveBeenCalled();
        done();
      });
    });

    describe('completeOperationsActions', () => {
      const channelId = 'channelId';
      const timestamp = 'timestamp';
      const botToken = 'botToken';
      const opsSlackId = 'SADASDS';
      requestData = {
        ...mockRouteRequestData,
        status: 'Declined',
        opsComment: 'no route'

      };

      beforeEach(() => {
        jest.spyOn(InteractivePrompts, 'messageUpdate').mockResolvedValue();
        jest.spyOn(OperationsNotifications, 'sendOpsDeclineMessageToFellow').mockResolvedValue({});
      });
      afterEach(() => {
        jest.resetAllMocks();
      });
      it('should complete the decline new route action', async () => {
        await OperationsNotifications.completeOperationsDeclineAction(
          requestData, botToken, channelId, timestamp, opsSlackId, true
        );
        expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
        expect(OperationsNotifications.sendOpsDeclineMessageToFellow).not.toHaveBeenCalled();
        expect(ManagerAttachmentHelper.getManagerCompleteAttachment).toHaveBeenCalled();
      });

      it('should send decline notification to user if any update is made', async () => {
        await OperationsNotifications.completeOperationsDeclineAction(
          requestData, botToken, channelId, timestamp, opsSlackId, false
        );
        expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
        expect(OperationsNotifications.sendOpsDeclineMessageToFellow).toHaveBeenCalled();
      });

      it('should complete approve new route action', async () => {
        requestData = {
          ...mockRouteRequestData,
          status: 'Approved',
          opsComment: 'okay'
        };

        const submission = { routeName: 'the dojo', takeOff: '10:00' };
        await OperationsNotifications.completeOperationsApprovedAction(
          requestData, channelId, timestamp, 1, botToken, submission, false
        );

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
});
