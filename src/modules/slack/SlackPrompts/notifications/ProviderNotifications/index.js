import SlackNotifications from '../../Notifications';
import {
  SlackButtonAction,
  SlackAttachment
} from '../../../SlackModels/SlackMessageModels';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import UserService from '../../../../../services/UserService';
import bugsnagHelper from '../../../../../helpers/bugsnagHelper';
import ProviderAttachmentHelper from './helper';
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
      bugsnagHelper.log(error);
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
    const directMessageId = await SlackNotifications.getDMChannelId(providerUserSlackId, slackBotOauthToken);
    const attachment = new SlackAttachment();
    const fields = SlackNotifications.notificationFields(tripDetails);
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction(
        'assign-cab',
        'Accept',
        'assign_cab_to_trip'
      )
    ]);
    attachment.addFieldsOrActions('fields', fields);
    attachment.addOptionalProps('provider_actions', 'fallback', '#FFCCAA', 'default');

    const message = SlackNotifications.createDirectMessage(directMessageId,
      `A trip has been assigned to *${providerName}*, please assign a cab`, [attachment]);
    return SlackNotifications.sendNotification(message, slackBotOauthToken);
  }
}
