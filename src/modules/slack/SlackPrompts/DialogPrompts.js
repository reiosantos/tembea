import {
  SlackDialogModel, SlackDialog, SlackDialogText, SlackDialogTextarea,
} from '../SlackModels/SlackDialogModels';
import dateDialogHelper from '../../../helpers/dateHelper';
import createDialogForm from '../../../helpers/slack/createDialogForm';
import sendDialogTryCatch from '../../../helpers/sendDialogTryCatch';
import TeamDetailsService from '../../../services/TeamDetailsService';

class DialogPrompts {
  static async sendTripDetailsForm(payload, formElementsFunction, callbackId) {
    const dialogForm = createDialogForm(payload, formElementsFunction, callbackId);

    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendRescheduleTripForm(payload, callbackId, state, dialogName) {
    const dialog = new SlackDialog(callbackId || payload.callback_id,
      dialogName, 'submit', true, state);

    dialog.addElements(dateDialogHelper.generateDialogElements());

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendTripReasonForm(payload) {
    const dialog = new SlackDialog('schedule_trip_reason',
      'Reason for booking trip', 'Submit');
    const textarea = new SlackDialogTextarea('Reason', 'reason',
      'Enter reason for booking the trip');

    dialog.addElements([textarea]);

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendDialogToManager(
    payload, callbackId, state, dialogName, submitButtonText, submissionName
  ) {
    const dialog = new SlackDialog(callbackId || payload.callbackId,
      dialogName, submitButtonText, false, state);

    const commentElement = new SlackDialogTextarea('Reason',
      submissionName,
      `Why do you want to ${submitButtonText} this trip`);
    dialog.addElements([commentElement]);

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendOperationsDeclineDialog(payload) {
    const actionTs = payload.message_ts;
    const { value } = payload.actions[0];
    const state = {
      trip: value,
      actionTs
    };
    const dialog = new SlackDialog('operations_reason_dialog',
      'Reason for declining', 'Submit', false, JSON.stringify(state));
    dialog.addElements([
      new SlackDialogTextarea('Justification', 'opsDeclineComment')
    ]);
    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const slackBotOauthToken = await
    TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendOperationsApprovalDialog(payload) {
    const { value } = payload.actions[0];
    const state = { tripId: value, timeStamp: payload.message_ts, channel: payload.channel.id };
    const dialog = new SlackDialog('operations_reason_dialog',
      'Confirm Trip Request', 'Submit', false, JSON.stringify(state));
    dialog.addElements([
      new SlackDialogText('Driver\'s name', 'driverName', 'Enter driver\'s name'),
      new SlackDialogText('Driver\'s contact', 'driverPhoneNo', 'Enter driver\'s contact'),
      new SlackDialogText(
        'Cab Registration number',
        'regNumber',
        'Enter the Cab\'s registration number'
      ),
      new SlackDialogTextarea(
        'Justification',
        'confirmationComment',
        'Reason why',
        'Enter reason for approving trip',
      ),
    ]);
    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }

  static async sendLocationForm(payload, location = 'home') {
    const dialog = new SlackDialog(`new_route_${location}`,
      'Create New Route', 'Submit', true);
    const hint = 'e.g Andela Kenya, Nairobi';
    dialog.addElements([
      new SlackDialogText(`Enter ${location} Address: `,
        'location', `Type in your ${location} address`, false, hint)
    ]);
    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    await sendDialogTryCatch(dialogForm, slackBotOauthToken);
  }
}


export default DialogPrompts;
