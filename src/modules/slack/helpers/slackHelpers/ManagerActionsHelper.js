import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import SlackInteractionsHelpers from './SlackInteractionsHelpers';

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
    SlackInteractionsHelpers.approveTripRequestByManager(payload, trip, respond);
  }
}

export default ManagerActionsHelper;
