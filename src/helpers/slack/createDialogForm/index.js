import createTripDetailsForm from '../createTripDetailsForm';
import {
  SlackDialog, SlackDialogModel
} from '../../../modules/slack/SlackModels/SlackDialogModels';

export default (payload, formElementsFunctionName, callbackId) => {
  const dialog = new SlackDialog(callbackId, 'Trip Details', 'Submit');
  const formElements = createTripDetailsForm[formElementsFunctionName]();

  dialog.addElements(formElements);

  return new SlackDialogModel(payload.trigger_id, dialog);
};
