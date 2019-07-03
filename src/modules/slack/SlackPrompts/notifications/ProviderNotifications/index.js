import SlackNotifications from '../../Notifications';
import {
  SlackButtonAction,
  SlackAttachment,
  SlackSelectAction
} from '../../../SlackModels/SlackMessageModels';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import UserService from '../../../../../services/UserService';
import ProviderAttachmentHelper from './helper';
import { InteractivePrompts } from '../../../RouteManagement/rootFile';
import BugsnagHelper from '../../../../../helpers/bugsnagHelper';
import ProviderService from '../../../../../services/ProviderService';
import { driverService } from '../../../../../services/DriverService';
import CabsHelper from '../../../helpers/slackHelpers/CabsHelper';

/**
 * A class representing provider notifications
 *
 * @class ProviderNotifications
 */
export default class ProviderNotifications {
  static async sendRouteRequestNotification(
    routeRequest, slackBotOauthToken, routeDetails
  ) {
    try {
      const provider = (routeDetails.Provider).split(',');
      const providerUser = await UserService.getUserById(provider[2]);
      if (!slackBotOauthToken) {
        const { botToken } = await (
          TeamDetailsService.getTeamDetailsByTeamUrl(routeDetails.teamUrl));
        slackBotOauthToken = botToken; // eslint-disable-line no-param-reassign
      }
      const channelID = await SlackNotifications.getDMChannelId(
        providerUser.slackId, slackBotOauthToken
      );
      const message = await ProviderAttachmentHelper.createProviderRouteAttachment(
        routeRequest, channelID, routeDetails
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  /**
   * Handler for sending notifications to provider
   *
   * @static
   * @param {number} providerUserSlackId - The unique identifier of the provider's owner
   * @param {string} slackBotOauthToken - Slackbot auth token
   * @param {Object} tripDetails - An object containing the trip detials
   * @returns {Function} HTTP client that makes request to Slack's Web API
   * @memberof ProviderNotifications
   */
  static async sendTripNotification(providerUserSlackId, providerName, slackBotOauthToken, tripDetails) {
    const { id: tripId } = tripDetails;
    const directMessageId = await SlackNotifications.getDMChannelId(providerUserSlackId, slackBotOauthToken);
    const attachment = new SlackAttachment();
    const fields = SlackNotifications.notificationFields(tripDetails);
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction(
        'assign-cab',
        'Accept',
        `${tripId}`
      )
    ]);
    attachment.addFieldsOrActions('fields', fields);
    attachment.addOptionalProps('provider_actions', 'fallback', '#FFCCAA', 'default');

    const message = SlackNotifications.createDirectMessage(directMessageId,
      `A trip has been assigned to *${providerName}*, please assign a cab`, [attachment]);
    return SlackNotifications.sendNotification(message, slackBotOauthToken);
  }

  /**
   * @method UpdateProviderNotification
   * @description Updates provider notification after assigning a cab and vehicle
   * @param {string} channel
   * @param {string} botToken
   * @param {object} trip
   * @param {string} timeStamp
   * @param {string} driverDetails
   */
  static async UpdateProviderNotification(channel, botToken, trip, timeStamp, driverDetails) {
    const { cab: { providerId } } = trip;
    const provider = await ProviderService.findProviderByPk(providerId);

    const message = `Thank you *${provider.name}* for completing this trip request`;
    const tripDetailsAttachment = new SlackAttachment('Trip request complete');
    tripDetailsAttachment.addOptionalProps('', '', '#3c58d7');
    tripDetailsAttachment.addFieldsOrActions('fields',
      ProviderAttachmentHelper.providerFields(trip, driverDetails));
    try {
      await InteractivePrompts.messageUpdate(channel,
        message,
        timeStamp,
        [tripDetailsAttachment],
        botToken);
    } catch (err) {
      BugsnagHelper.log(err);
    }
  }

  /**
  * Updates the notification message sent to the providers
  * team to avoid approving a request
  * twice
  * @param {RouteRequest} routeRequest - Sequelize route request model
  * @param {number} channel - Slack channel id
  * @param {string} timestamp - Timestamp of the message to update
  * @param opsId
  * @param {string} botToken - Slack authentication token for tembea bot
  * @param submission
  * @param {boolean} update
  * @return {Promise<void>}
  */
  static async completeProviderApprovedAction(
    routeRequest, channel, teamId, timestamp, botToken, submission, update
  ) {
    const { engagement: { fellow } } = routeRequest;
    const title = 'Route Request Approved';
    const message = ':white_check_mark: You have approved this route request';
    const attachments = await ProviderAttachmentHelper.getProviderCompleteAttachment(
      message, title, routeRequest, submission
    );
    InteractivePrompts.messageUpdate(
      channel,
      `Hi, You have just approved <@${fellow.slackId}> route request.`
      + '*`This is a recurring trip.`*',
      timestamp,
      attachments,
      botToken
    );
    if (!update) {
      ProviderNotifications
        .sendToOpsDept(routeRequest, teamId, botToken, submission);
      ProviderNotifications
        .sendProviderApproveMessageToFellow(routeRequest, botToken, submission);
      ProviderNotifications
        .sendProviderApproveMessageToManager(routeRequest, botToken, submission);
    }
  }

  static async sendToOpsDept(routeRequest, teamId, slackBotOauthToken, submission) {
    const teamDetails = await TeamDetailsService.getTeamDetails(teamId);
    const { opsChannelId } = teamDetails;
    const message = await ProviderAttachmentHelper.getManagerApproveAttachment(
      routeRequest, opsChannelId, submission, false
    );
    return SlackNotifications.sendNotification(message, slackBotOauthToken);
  }


  /**
      * Sends notification to the manager
      * when a fellow request for a new route have been approved.
      * @return {Promise<*>}
      * @param routeRequest
      * @param slackBotOauthToken
      * @param submission
      */
  static async sendProviderApproveMessageToManager(
    routeRequest, slackBotOauthToken, submission
  ) {
    try {
      const channelID = await SlackNotifications.getDMChannelId(
        routeRequest.manager.slackId, slackBotOauthToken
      );
      const message = await ProviderAttachmentHelper.getManagerApproveAttachment(
        routeRequest, channelID, submission, true
      );
      return await SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  /**
      * This function sends a notification to the fellow
      * when the providers team approves the route request
      * @return {Promise<*>}
      * @param routeRequest
      * @param slackBotOauthToken
      * @param submission
      * @param teamUrl
      */
  static async sendProviderApproveMessageToFellow(
    routeRequest, slackBotOauthToken, submission, teamUrl
  ) {
    try {
      const { fellow } = routeRequest.engagement;
      if (!slackBotOauthToken) {
        const { botToken } = await (TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl));
        slackBotOauthToken = botToken; // eslint-disable-line no-param-reassign
      }
      const channelID = await SlackNotifications.getDMChannelId(
        fellow.slackId, slackBotOauthToken
      );
      const message = await ProviderAttachmentHelper.getFellowApproveAttachment(
        routeRequest, channelID, submission
      );
      return await SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  static async sendProviderReasignDriverMessage(driver, routes, slackUrl) {
    const { providerId, driverName } = driver;
    const provider = await ProviderService.findProviderByPk(providerId);
    const user = await UserService.getUserById(provider.providerUserId);
    const { botToken: teamBotOauthToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(slackUrl);
    const where = { providerId: provider.id };
    const { data: drivers } = await driverService.getPaginatedItems(undefined, where);
    const driverData = CabsHelper.driverLabel(drivers);
    const directMessageId = await SlackNotifications.getDMChannelId(user.slackId, teamBotOauthToken);

    const sendNotifucations = routes.map(route => ProviderNotifications.providerMessagePerRoute(
      route, driverData, directMessageId, driverName, teamBotOauthToken
    ));

    await Promise.all(sendNotifucations);
  }

  static async providerMessagePerRoute(
    route, driverData, directMessageId, driverName, teamBotOauthToken
  ) {
    const { id } = route;
    const attachment = new SlackAttachment('Assign another driver to route');
    const fields = ProviderAttachmentHelper.providerRouteFields(route);

    attachment.addFieldsOrActions('actions', [
      new SlackSelectAction(`${id}`, 'Select Driver', driverData)]);
    attachment.addFieldsOrActions('fields', fields);
    attachment.addOptionalProps('reassign_driver', 'fallback', '#FFCCAA', 'default');

    const message = SlackNotifications.createDirectMessage(directMessageId,
      `Your driver *${driverName}* has been deleted by the Operations team. :slightly_frowning_face:`,
      [attachment]);
    return SlackNotifications.sendNotification(message, teamBotOauthToken);
  }

  static async updateProviderReasignDriverMessage(channel, botToken, timeStamp, route, driver) {
    const message = 'Driver update complete. Thank you! :smiley:';
    const attachment = new SlackAttachment();
    attachment.addOptionalProps('', '', '#3c58d7');
    const routeFields = await ProviderAttachmentHelper.providerRouteFields(route);
    const driverFields = await ProviderAttachmentHelper.driverFields(driver);
    attachment.addFieldsOrActions('fields', routeFields);
    attachment.addFieldsOrActions('fields', driverFields);
    try {
      await InteractivePrompts.messageUpdate(channel,
        message,
        timeStamp,
        [attachment],
        botToken);
    } catch (err) {
      BugsnagHelper.log(err);
    }
  }
}
