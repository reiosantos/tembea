import SlackNotifications from '../../Notifications';
import { SlackButtonAction, SlackAttachment } from '../../../SlackModels/SlackMessageModels';
import TeamDetailsService from '../../../../../services/TeamDetailsService';

class TripNotifications {
  static async sendCompletionNotification(trip) {
    const { rider: { slackId }, department: { teamId } } = trip;

    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const directMessageId = await SlackNotifications.getDMChannelId(slackId, slackBotOauthToken);

    const actions = [
      new SlackButtonAction('trip_taken', 'Yes', trip.id),
      new SlackButtonAction('still_on_trip', 'Still on trip', trip.id),
      new SlackButtonAction('not_taken', 'No', trip.id, 'danger')
    ];
    const attachment = new SlackAttachment('', '', '', '', '');
    const fields = SlackNotifications.notificationFields(trip);

    attachment.addFieldsOrActions('actions', actions);
    attachment.addFieldsOrActions('fields', fields);
    attachment.addOptionalProps('trip_completion');

    const message = SlackNotifications.createDirectMessage(directMessageId,
      `Hi! <@${trip.rider.slackId}> Did you take this trip?`, attachment);
    return SlackNotifications.sendNotification(message, slackBotOauthToken);
  }
}
export default TripNotifications;
