import SlackNotifications from '../../Notifications';
import {
  SlackButtonAction,
  SlackAttachment
} from '../../../SlackModels/SlackMessageModels';

/**
 * A class representing provider notifications
 *
 * @class ProviderNotifications
 */
class ProviderNotifications {
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
  static async sendProviderNotification(providerUserSlackId, providerName, slackBotOauthToken, tripDetails) {
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
      `A trip request has been made to *${providerName}*, please assign a cab`, [attachment]);
    return SlackNotifications.sendNotification(message, slackBotOauthToken);
  }
}
export default ProviderNotifications;
