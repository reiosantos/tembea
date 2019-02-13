import RouteRequestService from '../../../../../services/RouteRequestService';
import bugsnagHelper from '../../../../../helpers/bugsnagHelper';
import SlackNotifications from '../../Notifications';
import { slackEventNames, SlackEvents } from '../../../events/slackEvents';
import InteractivePrompts from '../../InteractivePrompts';
import ManagerAttachmentHelper from './helper';
import TeamDetailsService from '../../../../../services/TeamDetailsService';

export default class ManagerNotifications {
  /**
   * Sends notification to the manager when a fellow request for a new route to be created.
   * @param respond
   * @param {{ routeRequestId:number, teamId:number}} data
   * @return {Promise<*>}
   */
  static async sendManagerNotification(respond, data) {
    try {
      const { routeRequestId, teamId } = data;
      const {
        slackBotOauthToken, routeRequest
      } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const { engagement: { fellow }, manager } = routeRequest;

      const channelID = await SlackNotifications.getDMChannelId(
        manager.slackId, slackBotOauthToken
      );
      const attachments = ManagerAttachmentHelper.getManagerMessageAttachment(routeRequest);
      const message = SlackNotifications.createDirectMessage(
        channelID,
        `Hey, <@${fellow.slackId}> just requested to create a new route. :smiley:`,
        [...attachments]
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
      respond({
        text: 'Error:warning:: Request saved, but I could not send a notification to your manager.'
      });
    }
  }

  /**
   * This function sends a notification to the fellow when a manager decline the route request
   * @param {{ routeRequestId:number, teamId:number}} data
   * @return {Promise<*>}
   */
  static async sendManagerDeclineMessageToFellow(data) {
    try {
      const { routeRequestId, teamId } = data;
      const {
        slackBotOauthToken, routeRequest
      } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const { fellow } = routeRequest.engagement;
      const channelID = await SlackNotifications.getDMChannelId(
        fellow.slackId, slackBotOauthToken
      );
      const message = ManagerAttachmentHelper.getManagerApproveOrDeclineAttachment(
        routeRequest, channelID
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  /**
   * Sends notification to fellow who requested for a route and the ops team when a manager confirms
   * the route request
   * @param payload
   * @param respond
   * @param data
   * @return {Promise<*>}
   */
  static async sendManagerApproval(payload, respond, data) {
    try {
      const { routeRequestId, teamId } = data;
      const {
        slackBotOauthToken, routeRequest
      } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const { fellow } = routeRequest.engagement;
      const channelID = await SlackNotifications.getDMChannelId(
        fellow.slackId, slackBotOauthToken
      );
      SlackEvents.raise(
        slackEventNames.RECEIVE_NEW_ROUTE_REQUEST,
        payload,
        routeRequestId
      );
      const message = ManagerAttachmentHelper.getManagerApproveOrDeclineAttachment(
        routeRequest, channelID
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  /**
   * Updates the notification message sent to the manager to avoid approving or declining a request
   * twice
   * @param {RouteRequest} routeRequest - Sequelize route request model
   * @param {number} channel - Slack channel id
   * @param {string} timestamp - Timestamp of the message to update
   * @param {string} botToken - Slack authentication token for tembea bot
   * @return {Promise<void>}
   */
  static async completeManagerAction(routeRequest, channel, timestamp, botToken) {
    try {
      const {
        title, message, text, color
      } = ManagerAttachmentHelper.completeManagerActionLabels(routeRequest);
      if (!title) return;
      const attachments = ManagerAttachmentHelper.getManagerCompleteAttachment(
        message, title, routeRequest, color
      );
      await InteractivePrompts.messageUpdate(
        channel,
        text,
        timestamp,
        attachments,
        botToken
      );
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async handleStatusValidationError(payload, routeRequest) {
    const { channel: { id: channelId }, original_message: { ts } } = payload;
    const { team: { id: { teamId } } } = payload;
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    await ManagerNotifications.completeManagerAction(
      routeRequest, channelId, ts, slackBotOauthToken
    );
  }
}
