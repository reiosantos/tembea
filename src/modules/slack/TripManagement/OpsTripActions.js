import { SlackAttachment } from '../SlackModels/SlackMessageModels';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import InteractivePromptsHelpers from '../helpers/slackHelpers/InteractivePromptsHelpers';
import { InteractivePrompts } from '../RouteManagement/rootFile';

export default class OpsTripActions {
  /**
   * @method sendUserCancellation
   * @description Updates slack message to indicate cancelled status
   * @param channel
   * @param botToken
   * @param trip
   * @param userId
   * @param timeStamp
   */
  static async sendUserCancellation(channel, botToken, trip, userId, timeStamp) {
    const message = 'Trip cancelled';
    const tripDetailsAttachment = new SlackAttachment(message);
    const detailsAttachment = new SlackAttachment(
      `:negative_squared_cross_mark: <@${userId}> already cancelled this trip`
    );
   
    detailsAttachment.addOptionalProps('', '', 'danger');
    tripDetailsAttachment.addOptionalProps('', '', 'danger');
    tripDetailsAttachment.addFieldsOrActions('fields',
      InteractivePromptsHelpers.addOpsNotificationTripFields(trip));

    try {
      await InteractivePrompts.messageUpdate(channel,
        message,
        timeStamp,
        [tripDetailsAttachment, detailsAttachment],
        botToken);
    } catch (err) {
      BugsnagHelper.log(err);
    }
  }
}
