import SlackNotifications from '../../Notifications';
import bugsnagHelper from '../../../../../helpers/bugsnagHelper';
import OpsAttachmentHelper from './helper';
import InteractivePrompts from '../../InteractivePrompts';

export default class OperationsNotifications {
  /**
   * Updates the notification message sent to the operations
   * team to avoid approving or declining a request
   * twice
   * @param {RouteRequest} routeRequest - Sequelize route request model
   * @param {number} channel - Slack channel id
   * @param {string} timestamp - Timestamp of the message to update
   * @param opsId
   * @param {string} botToken - Slack authentication token for tembea bot
   * @param submission
   * @return {Promise<void>}
   */
  static async completeOperationsApprovedAction(
    routeRequest, channel, timestamp, opsId, botToken, submission
  ) {
    const { engagement: { fellow } } = routeRequest;
    const title = 'Route Request Approved';
    const message = ':white_check_mark: You have approved this route';
    const attachments = OpsAttachmentHelper.getOperationCompleteAttachment(
      message, title, routeRequest, submission
    );
    InteractivePrompts.messageUpdate(
      channel,
      `<@${opsId}> have just approved <@${fellow.slackId}> route request`,
      timestamp,
      attachments,
      botToken
    );
    OperationsNotifications
      .sendOpsApproveMessageToFellow(routeRequest, botToken, submission);
    OperationsNotifications
      .sendOpsApproveMessageToManager(routeRequest, botToken, submission);
  }

  /**
   * Sends notification to the manager
   * when a fellow request for a new route have been approved.
   * @return {Promise<*>}
   * @param routeRequest
   * @param slackBotOauthToken
   * @param submission
   */
  static async sendOpsApproveMessageToManager(
    routeRequest, slackBotOauthToken, submission
  ) {
    try {
      const channelID = await SlackNotifications.getDMChannelId(
        routeRequest.manager.slackId, slackBotOauthToken
      );
      const message = OpsAttachmentHelper.getManagerApproveAttachment(
        routeRequest, channelID, submission
      );
      return await SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  /**
   * This function sends a notification to the fellow
   * when the operations team approves the route request
   * @return {Promise<*>}
   * @param routeRequest
   * @param slackBotOauthToken
   * @param submission
   */
  static async sendOpsApproveMessageToFellow(
    routeRequest, slackBotOauthToken, submission
  ) {
    try {
      const { fellow } = routeRequest.engagement;
      const channelID = await SlackNotifications.getDMChannelId(
        fellow.slackId, slackBotOauthToken
      );
      const message = OpsAttachmentHelper.getFellowApproveAttachment(
        routeRequest, channelID, submission
      );
      return await SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}
