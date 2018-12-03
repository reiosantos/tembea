import SlackHelpers from '../../../helpers/slack/slackHelpers';
import {
  SlackDialogModel,
  SlackDialogSelectElementWithOptions,
  SlackDialog,
  SlackDialogText,
  SlackDialogElementWithDataSource,
  SlackDialogTextarea
} from '../SlackModels/SlackDialogModels';
import dateDialogHelper from '../../../helpers/dateHelper';

import WebClientSingleton from '../../../utils/WebClientSingleton';

const web = new WebClientSingleton();

class DialogPrompts {
  static async sendTripDetailsForm(payload, forSelf) {
    const dialog = new SlackDialog('schedule_trip_form', 'Trip Details', 'Submit');
    const hint = `Enter date in DD/MM/YYYY format,
    leave a space and enter time in HH:MM format. e.g 01/11/2019 22:00`;

    if (forSelf === 'false') {
      dialog.addElements([new SlackDialogElementWithDataSource("Rider's name", 'rider')]);
    }

    const departments = await SlackHelpers.getDepartments();

    dialog.addElements([
      new SlackDialogSelectElementWithOptions("Rider's department", 'department', departments),
      new SlackDialogText('Pickup location', 'pickup', "Enter rider's pickup location"),
      new SlackDialogText('Destination', 'destination', "Enter rider's destination"),
      new SlackDialogText('Date and Time', 'dateTime', 'dd/mm/yyyy hh:mm', hint)
    ]);

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    web.getWebClient().dialog.open(dialogForm);
  }

  static sendRescheduleTripForm(payload, callbackId, state, dialogName) {
    const dialog = new SlackDialog(
      callbackId || payload.callback_id,
      dialogName,
      'submit',
      true,
      state
    );

    dialog.addElements(dateDialogHelper.generateDialogElements());

    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);

    web.getWebClient().dialog.open(dialogForm);
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

    return web.getWebClient().dialog.open(dialogForm);
  }
  
  static sendCommentDialog(payload) {
    const actionTs = payload.message_ts;
    const { value } = payload.actions[0];
    const state = {
      trip: value,
      actionTs
    };
    const dialog = new SlackDialog('operations_reason_dialog', 'Reason for declining', 'Submit', false, JSON.stringify(state));
    dialog.addElements([
      new SlackDialogText('Justification', 'comment', 'Enter reason for declining trip', 'Reason why', 'textarea')
    ]);
    const dialogForm = new SlackDialogModel(payload.trigger_id, dialog);
    web.getWebClient().dialog.open(dialogForm);
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
