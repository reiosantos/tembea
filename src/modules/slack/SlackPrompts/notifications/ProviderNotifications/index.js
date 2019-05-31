import SlackNotifications from '../../Notifications';
import {
  SlackButtonAction,
  SlackAttachment
} from '../../../SlackModels/SlackMessageModels';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import UserService from '../../../../../services/UserService';
import ProviderAttachmentHelper from './helper';
import { InteractivePrompts } from '../../../RouteManagement/rootFile';
import BugsnagHelper from '../../../../../helpers/bugsnagHelper';
import ProviderService from '../../../../../services/ProviderService';

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
}
