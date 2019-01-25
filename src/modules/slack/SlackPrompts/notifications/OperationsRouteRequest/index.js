import SlackNotifications from '../../Notifications';
import bugsnagHelper from '../../../../../helpers/bugsnagHelper';
import ManagerAttachmentHelper from '../ManagerRouteRequest/helper';
import OpsAttachmentHelper from './helper';
import InteractivePrompts from '../../InteractivePrompts';
import RouteRequestService from '../../../../../services/RouteRequestService';
import TeamDetailsService from '../../../../../services/TeamDetailsService';

export default class OperationsNotifications {
  /**
   * This function sends a notification to the fellow
   * when the operations team declines the route request
   * @return {Promise<*>}
   * @param routeRequestId
   * @param teamId
   */
  static async sendOpsDeclineMessageToFellow(routeRequestId, teamId) {
    try {
      const routeRequest = await RouteRequestService.getRouteRequest(routeRequestId);
      const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);

      const { fellow } = routeRequest.engagement;
      const { manager: slackId } = routeRequest;

      const fellowChannelID = await SlackNotifications.getDMChannelId(
        fellow.slackId, slackBotOauthToken
      );
      const managerChannelID = await SlackNotifications.getDMChannelId(
        slackId.slackId, slackBotOauthToken
      );
      const fellowMessage = OpsAttachmentHelper.getOperationDeclineAttachment(
        routeRequest, fellowChannelID, 'fellow'
      );

      const managerMessage = OpsAttachmentHelper.getOperationDeclineAttachment(
        routeRequest, managerChannelID
      );
      SlackNotifications.sendNotification(fellowMessage, slackBotOauthToken);
      SlackNotifications.sendNotification(managerMessage, slackBotOauthToken);
      return;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

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

  static async completeOperationsDeclineAction(
    routeRequest, channel, teamId, routeRequestId, timestamp, botToken, payload
  ) {
    try {
      const { user: { id } } = payload;
      const title = 'Route Request Declined';
      const message = `:x: <@${id}> has declined this route`;
      const attachments = ManagerAttachmentHelper.getManagerCompleteAttachment(
        message, title, routeRequest, '#ff0000'
      );
      await InteractivePrompts.messageUpdate(
        channel,
        '',
        timestamp,
        attachments,
        botToken
      );
      await OperationsNotifications
        .sendOpsDeclineMessageToFellow(routeRequestId, teamId);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}
