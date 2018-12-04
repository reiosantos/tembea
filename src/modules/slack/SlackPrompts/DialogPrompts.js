import {
  SlackDialogModel, SlackDialog, SlackDialogText, SlackDialogTextarea
} from '../SlackModels/SlackDialogModels';
import { SlackActionTypes } from '../SlackModels/SlackMessageModels';
import dateDialogHelper from '../../../helpers/dateHelper';
import createTripDetailsForm from '../../../helpers/slack/createTripDetailsForm';
import sendDialogTryCatch from '../../../helpers/sendDialogTryCatch';

class DialogPrompts {
  static async sendTripDetailsForm(payload) {
    const dialog = new SlackDialog('schedule_trip_locationTime', 'Trip Details', 'Submit');
    const formElements = createTripDetailsForm();

    dialog.addElements(formElements);

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);

    sendDialogTryCatch(dialogForm);
  }

  static async sendRescheduleTripForm(payload, callbackId, state, dialogName) {
    const dialog = new SlackDialog(callbackId || payload.callback_id,
      dialogName, 'submit', true, state);

    dialog.addElements(dateDialogHelper.generateDialogElements());

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);

    sendDialogTryCatch(dialogForm);
  }

  static async sendTripReasonForm(payload) {
    const dialog = new SlackDialog('schedule_trip_reason',
      'Reason for booking trip', 'Submit');
    const textarea = new SlackDialogText('Reason', 'reason', SlackActionTypes.textarea);
    textarea.addOptionalProps('Enter reason for booking the trip');

    dialog.addElements([textarea]);

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);

    sendDialogTryCatch(dialogForm);
  }

  static async sendDialogToManager(
    payload, callbackId, state, dialogName, submitButtonText, submissionName
  ) {
    const dialog = new SlackDialog(callbackId || payload.callbackId,
      dialogName, submitButtonText, false, state);

    const commentElement = new SlackDialogTextarea('Reason',
      submissionName,
      `Why do you wan to ${submitButtonText} this trip`);
    dialog.addElements([commentElement]);

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);

    sendDialogTryCatch(dialogForm);
  }

  static async sendCommentDialog(payload) {
    const actionTs = payload.message_ts;
    const { value } = payload.actions[0];
    const state = {
      trip: value,
      actionTs
    };
    const dialog = new SlackDialog('operations_reason_dialog',
      'Reason for declining', 'Submit', false, JSON.stringify(state));
    dialog.addElements([
      new SlackDialogTextarea('Justification', 'comment')
    ]);
    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);

    sendDialogTryCatch(dialogForm);
  }

  static sendOperationsApprovalDialog(payload) {
    const { value } = payload.actions[0];
    const dialog = new SlackDialog('operations_reason_dialog', 'Confirm Trip Request', 'Submit', false, value);
    dialog.addElements([
      new SlackDialogText('Driver\'s name', 'driverName', 'Enter driver\'s name'),
      new SlackDialogText('Driver\'s contact', 'driverPhoneNo', 'Enter driver\'s contact'),
      new SlackDialogText(
        'Cab Registration number',
        'regNumber',
        'Enter the Cab\'s registration number'
      ),
      new SlackDialogText(
        'Justification',
        'confirmationComment',
        'Enter reason for approving trip',
        'Reason why', 'textarea'
      ),
    ]);
    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    web.getWebClient().dialog.open(dialogForm);
  }
}


export default DialogPrompts;
