import {
  SlackDialog,
  SlackDialogText,
  SlackDialogTextarea
} from '../SlackModels/SlackDialogModels';
import DialogPrompts from './DialogPrompts';

class OpsDialogPrompts {
  static async sendOpsSelectCabDialog(payload) {
    const {
      actions: [{ selected_options: [{ value }] }], message_ts: timeStamp,
      channel: { id: channel }
    } = payload;
    const [, tripId] = value.split('_');
    const state = { tripId, timeStamp, channel, };
    const dialog = new SlackDialog('ops_approval_trip', 'Assign cab and driver', 'Submit', false, JSON.stringify(state));
    dialog.addElements([
      new SlackDialogText('Driver\'s name', 'driver', 'Enter the Driver\'s name'),
      new SlackDialogText('Driver\'s phone number', 'driverNumber', 'Enter the Driver\'s phone number'),
      new SlackDialogText('Cab\'s name', 'cab', 'Enter the Cab\'s name'),
      new SlackDialogText('Cab\'s registration number', 'regNumber', 'Enter the Cab\'s registration number'),
      new SlackDialogTextarea(
        'Justification',
        'confirmationComment',
        'Enter reason for approving this trip',
        'Enter reason for approval',
      ),
    ]);
    return DialogPrompts.sendDialog(dialog, payload);
  }
}

export default OpsDialogPrompts;
