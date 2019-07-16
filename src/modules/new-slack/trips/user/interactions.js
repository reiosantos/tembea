import DialogPrompts from '../../../slack/SlackPrompts/DialogPrompts';
import { SlackDialog, SlackDialogText } from '../../../slack/SlackModels/SlackDialogModels';
import { userTripActions } from './user-trip-helpers';

export default class Interactions {
  static async sendPriceForm(payload, state) {
    const dialog = new SlackDialog(userTripActions.payment,
      'The price of the trip', 'Submit', '', JSON.stringify(state));
    const textArea = new SlackDialogText('Price', 'price',
      'Enter total amount of the trip in Ksh.');

    dialog.addElements([textArea]);
    await DialogPrompts.sendDialog(dialog, payload);
  }
}
