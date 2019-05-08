import {
  SlackDialog, SlackDialogText, SlackDialogElementWithDataSource
} from '../../SlackModels/SlackDialogModels';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';

class JoinRouteDialogPrompts {
  static async sendFellowDetailsForm(payload, value) {
    const selectManager = new SlackDialogElementWithDataSource('Select Manager', 'manager');
    const dialog = new SlackDialog(
      'join_route_fellowDetails', 'Enter your details', 'submit', true, value
    );
    const workHoursText = new SlackDialogText(
      'Work hours', 'workHours', '18:00 - 00:00', false, 'hh:mm E.g. 18:00 - 00:00'
    );
    dialog.addElements([selectManager, workHoursText]);
    await DialogPrompts.sendDialog(dialog, payload);
  }
}

export default JoinRouteDialogPrompts;
