import SlackNotifications from '../../Notifications';
import bugsnagHelper from '../../../../../helpers/bugsnagHelper';
import ManagerAttachmentHelper from '../ManagerRouteRequest/helper';
import OpsAttachmentHelper from './helper';
import InteractivePrompts from '../../InteractivePrompts';
import RouteRequestService from '../../../../../services/RouteRequestService';
import SlackHelpers from '../../../helpers/slackHelpers/index';

export default class OperationsNotifications {
  /**
   * This function sends a notification to the fellow
   * when the operations team declines the route request
   * @return {Promise<*>}
   * @param routeRequestId
   * @param teamId
   * @param teamUrl
   */
  static async sendOpsDeclineMessageToFellow(routeRequestId, teamId, teamUrl) {
    try {
      const routeRequest = await RouteRequestService.findByPk(routeRequestId, true);
      const slackBotOauthToken = await SlackHelpers.getSlackBotOAuthToken(teamId, teamUrl);
      const { engagement: { fellow } } = routeRequest;
      const fellowChannelID = await SlackNotifications.getDMChannelId(fellow.slackId, slackBotOauthToken);
      const fellowMessage = await OpsAttachmentHelper.getOperationDeclineAttachment(routeRequest,
        fellowChannelID, 'fellow');
      SlackNotifications.sendNotification(fellowMessage, slackBotOauthToken);
      return;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async sendOpsDeclineMessageToManager(routeRequestId, teamId, teamUrl) {
    try {
      const routeRequest = await RouteRequestService.findByPk(routeRequestId, true);
      const slackBotOauthToken = await SlackHelpers.getSlackBotOAuthToken(teamId, teamUrl);
      const { manager: { slackId } } = routeRequest;
      const managerChannelID = await SlackNotifications.getDMChannelId(slackId, slackBotOauthToken);
      const managerMessage = await OpsAttachmentHelper.getOperationDeclineAttachment(
        routeRequest, managerChannelID
      );
      await SlackNotifications.sendNotification(managerMessage, slackBotOauthToken);
      return;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async completeOperationsRouteApproval(routeRequest, submission, opsData) {
    const botToken = opsData
      ? opsData.botToken : await SlackHelpers.getBotToken(submission.teamUrl);
    if (opsData) {
      const { opsUserId, timeStamp, channelId } = opsData;
      await OperationsNotifications.completeOperationsApprovedAction(
        routeRequest, channelId, timeStamp, opsUserId, botToken, submission
      );
    }
  }

  /**
   * Updates the notification message sent to the operations
   * team to avoid approving or declining a request
   * twice
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
    const { engagement: { fellow } } = routeRequest;
    const title = 'Route Request Approved';
    const message = ':white_check_mark: You have approved this route request';
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
    routeRequest, channel, teamId, routeRequestId, timestamp, botToken, payload, update
  ) {
    try {
      const { user: { id } } = payload;
      const title = 'Route Request Declined';
      const message = `:x: <@${id}> has declined this route request`;
      const attachments = await ManagerAttachmentHelper.getManagerCompleteAttachment(
        message, title, routeRequest, '#ff0000'
      );
      await InteractivePrompts.messageUpdate(
        channel,
        '',
        timestamp,
        attachments,
        botToken
      );

      if (!update) {
        await OperationsNotifications
          .sendOpsDeclineMessageToFellow(routeRequestId, teamId);
      }

      await OperationsNotifications.sendOpsDeclineMessageToFellow(routeRequestId, teamId);
      await OperationsNotifications.sendOpsDeclineMessageToManager(routeRequestId, teamId);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async updateOpsStatusNotificationMessage(payload, routeRequest, botToken) {
    const {
      channel, message_ts: timeStamp, team, actions
    } = payload;

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
        .completeOperationsDeclineAction(routeRequest,
          channel.id, team.id, actions[0].value,
          timeStamp, botToken, payload, true);
    }
  }
}
