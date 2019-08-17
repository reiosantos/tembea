import SlackNotifications from '../../Notifications';
import bugsnagHelper from '../../../../../helpers/bugsnagHelper';
import ManagerAttachmentHelper from '../ManagerRouteRequest/helper';
import OpsAttachmentHelper from './helper';
import InteractivePrompts from '../../InteractivePrompts';
import { Cache } from '../../../RouteManagement/rootFile';

export default class OperationsNotifications {
  /**
   * This function sends a notification to the fellow
   * when the operations team declines the route request
   * @return {Promise<*>}
   * @param routeRequestId
   * @param botToken
   */
  static async sendOpsDeclineMessageToFellow(routeRequest, botToken) {
    try {
      const { engagement: { fellow } } = routeRequest;
      const fellowChannelID = await SlackNotifications.getDMChannelId(fellow.slackId, botToken);
      const fellowMessage = await OpsAttachmentHelper.getOperationDeclineAttachment(routeRequest,
        fellowChannelID, 'fellow');
      SlackNotifications.sendNotification(fellowMessage, botToken);
      return;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async sendOpsDeclineMessageToManager(routeRequest, botToken) {
    try {
      const { manager: { slackId } } = routeRequest;
      const managerChannelID = await SlackNotifications.getDMChannelId(slackId, botToken);
      const managerMessage = await OpsAttachmentHelper.getOperationDeclineAttachment(
        routeRequest, managerChannelID
      );
      await SlackNotifications.sendNotification(managerMessage, botToken);
      return;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  /**
   * Updates the notification message sent to the operations
   * team to avoid approving or declining a request
   * twice
   * Also deletes the cached timestamp of the message after ops has approved
   * @param {RouteRequest} routeRequest - Sequelize route request model
   * @param {number} channel - Slack channel id
   * @param {string} timestamp - Timestamp of the message to update
   * @param {string} opsId = the slackid of the user
   * @param {string} botToken - Slack authentication token for tembea bot
   * @param submission
   * @param {boolean} update
   * @return {Promise<void>}
   */
  static async completeOperationsApprovedAction(
    routeRequest, channel, timestamp, opsSlackId, botToken, submission
  ) {
    await Cache.delete(`RouteRequestTimeStamp_${routeRequest.id}`);
    const { engagement: { fellow } } = routeRequest;
    const title = 'Route Request Approved';
    const message = ':white_check_mark: This route request has been approved';
    const attachments = await OpsAttachmentHelper.getOperationCompleteAttachment(
      message, title, routeRequest, submission
    );
    await InteractivePrompts.messageUpdate(
      channel,
      `<@${opsSlackId}> has just approved <@${fellow.slackId}>'s route request`,
      timestamp,
      attachments,
      botToken
    );
  }

  static async completeOperationsDeclineAction(
    routeRequest, botToken, channel, timestamp, opsSlackId, update
  ) {
    try {
      await Cache.delete(`RouteRequestTimeStamp_${routeRequest.id}`);
      const title = 'Route Request Declined';
      const message = `:x: <@${opsSlackId}> has declined this route request`;
      const attachments = await ManagerAttachmentHelper.getManagerCompleteAttachment(
        message, title, routeRequest, '#ff0000'
      );
      if (!update) {
        await OperationsNotifications
          .sendOpsDeclineMessageToFellow(routeRequest, botToken);
      }
      

      const opsDeclineNotification = InteractivePrompts.messageUpdate(
        channel, '', timestamp, attachments, botToken
      );
      const managerDeclineNotification = OperationsNotifications.sendOpsDeclineMessageToManager(
        routeRequest, botToken
      );
      return Promise.all(
        [opsDeclineNotification, managerDeclineNotification]
      );
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async updateOpsStatusNotificationMessage(payload, routeRequest, botToken) {
    const { channel, message_ts: timeStamp } = payload;

    if (routeRequest.status === 'Approved') {
      const opsNotify = await OperationsNotifications
        .completeOperationsApprovedAction(routeRequest,
          channel.id, timeStamp,
          routeRequest.opsReviewer.slackId,
          botToken, {}, true);
      return opsNotify;
    }

    if (routeRequest.status === 'Declined') {
      return OperationsNotifications
        .completeOperationsDeclineAction(routeRequest, botToken,
          channel.id, timeStamp, payload, true);
    }
  }
}
