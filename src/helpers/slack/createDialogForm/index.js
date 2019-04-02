import createTripDetailsForm from '../createTripDetailsForm';
import {
  SlackDialog, SlackDialogModel
} from '../../../modules/slack/SlackModels/SlackDialogModels';

export default (triggerId, formElementsFunctionName, callbackId, dialogTitle = 'Trip Details', state) => {
  const dialog = new SlackDialog(callbackId, dialogTitle, 'Submit', ' ', state);
  const formElements = createTripDetailsForm[formElementsFunctionName](state);

  dialog.addElements(formElements);

  return new SlackDialogModel(triggerId, dialog);
};
