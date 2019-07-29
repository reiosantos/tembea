import {
  SlackDialog, SlackDialogTextarea, SlackDialogText
} from '../../../slack/SlackModels/SlackDialogModels';
import { DialogPrompts } from '../../../slack/RouteManagement/rootFile';
import userTripActions from './actions';
import UserTripHelpers from './user-trip-helpers';
import UpdateSlackMessageHelper from '../../../../helpers/slack/updatePastMessageHelper';

export default class Interactions {
  static async sendTripReasonForm(payload, state) {
    const dialog = new SlackDialog(userTripActions.reasonDialog,
      'Reason for booking trip', 'Submit', '', JSON.stringify(state));
    const textarea = new SlackDialogTextarea('Reason', 'reason',
      'Enter reason for booking the trip');

    dialog.addElements([textarea]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendDetailsForm(payload, state, {
    title, submitLabel, callbackId, fields
  }) {
    const dialog = new SlackDialog(callbackId,
      title, submitLabel, '', JSON.stringify(state));
    dialog.addElements(fields);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async sendPostPickUpMessage(payload) {
    const message = await UserTripHelpers.getPostPickupMessage(payload);
    const { origin } = JSON.parse(payload.state);
    await UpdateSlackMessageHelper.newUpdateMessage(origin, message);
  }

  static async sendPostDestinationMessage(payload) {
    const message = await UserTripHelpers.getPostDestinationMessage(payload);
    await Interactions.sendMessage(payload, message);
  }

  static async sendMessage(payload, message) {
    const { origin } = JSON.parse(payload.state);
    await UpdateSlackMessageHelper.newUpdateMessage(origin, message);
  }

  static async sendAddPassengers(state) {
    const message = UserTripHelpers.getAddPassengersMessage();
    const { origin } = JSON.parse(state);
    await UpdateSlackMessageHelper.newUpdateMessage(origin, message);
  }

  static async sendPriceForm(payload, state) {
    const priceDialog = new SlackDialog(userTripActions.payment,
      'The price of the trip', 'Submit', '', JSON.stringify(state));
    priceDialog.addElements([new SlackDialogText('Price', 'price',
      'Enter total amount of the trip in Ksh.')]);
    await DialogPrompts.sendDialog(priceDialog, payload);
  }
}
