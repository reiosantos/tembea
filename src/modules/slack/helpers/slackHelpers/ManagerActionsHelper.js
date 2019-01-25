import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import SlackInteractions from '../../SlackInteractions';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';

class ManagerActionsHelper {
  static async managerDecline(payload) {
    const { value } = payload.actions[0];

    DialogPrompts.sendReasonDialog(payload,
      'decline_trip',
      `${payload.original_message.ts} ${payload.channel.id} ${value}`,
      'Decline', 'Decline', 'declineReason');
  }

  static async managerApprove(payload, respond) {
    const { value } = payload.actions[0];
    const trip = await SlackHelpers.isRequestApproved(value, payload.user.id);
    SlackInteractions.approveTripRequestByManager(payload, trip, respond);
  }
}

export default ManagerActionsHelper;
