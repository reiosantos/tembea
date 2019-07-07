import createTripDetailsForm from '../createTripDetailsForm';
import {
  SlackDialog, SlackDialogModel
} from '../../../modules/slack/SlackModels/SlackDialogModels';

export default (
  payload,
  formElementsFunctionName,
  callbackId,
  dialogTitle = 'Trip Details', defaultNote
) => {
  const stateValue = JSON.stringify(payload);
  const dialog = new SlackDialog(callbackId, dialogTitle, 'Submit', ' ', stateValue);
  const formElements = createTripDetailsForm[formElementsFunctionName](defaultNote);

  dialog.addElements(formElements);

  return new SlackDialogModel(payload.trigger_id, dialog);
};
