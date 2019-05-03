import createTripDetailsForm from '../createTripDetailsForm';
import {
  SlackDialog, SlackDialogModel
} from '../../../modules/slack/SlackModels/SlackDialogModels';

export default (payload, formElementsFunctionName, callbackId, dialogTitle = 'Trip Details', state = null) => {
  const stateValue = state === null ? JSON.stringify(payload) : null;
  const dialog = new SlackDialog(callbackId, dialogTitle, 'Submit', ' ', stateValue);
  const formElements = createTripDetailsForm[formElementsFunctionName](state);

  dialog.addElements(formElements);

  return new SlackDialogModel(payload.trigger_id, dialog);
};
