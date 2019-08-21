import {
  SlackDialog,
  SlackDialogSelectElementWithOptionGroups
} from '../SlackModels/SlackDialogModels';
import DialogPrompts from './DialogPrompts';
import ProviderService from '../../../services/ProviderService';
import HomebaseService from '../../../services/HomebaseService';
import { toLabelValuePairs } from '../helpers/formHelper';

class OpsDialogPrompts {
  static async selectDriverAndCab(payload, tripId) {
    const {
      user: { id: slackId },
      message_ts: timeStamp,
      channel: { id: channel },
    } = payload;
    const state = { tripId, timeStamp, channel, };

    const homebase = await HomebaseService.getHomeBaseBySlackId(slackId);
    const providers = await ProviderService.getViableProviders(homebase.id);

    const driversOptionsGroups = OpsDialogPrompts.createOptionsGroups(providers,
      { name: 'name', prop: 'drivers' },
      { label: 'driverName', value: 'id' });

    const cabsOptionsGroups = OpsDialogPrompts.createOptionsGroups(providers,
      { name: 'name', prop: 'vehicles' },
      { label: 'regNumber', value: 'id' });

    const dialog = new SlackDialog(
      'ops_approval_trip',
      'Assign cab and driver',
      'Submit',
      false,
      JSON.stringify(state)
    );

    dialog.addElements([
      new SlackDialogSelectElementWithOptionGroups(
        'Driver',
        'driver',
        driversOptionsGroups
      ),
      new SlackDialogSelectElementWithOptionGroups(
        'Cab',
        'cab',
        cabsOptionsGroups
      )
    ]);

    return DialogPrompts.sendDialog(dialog, payload);
  }

  static createOptionsGroups(data, { name, prop }, { label, value }) {
    return data.map(entry => ({
      label: entry[name],
      options: toLabelValuePairs(entry[prop], { labelProp: label, valueProp: value })
    }));
  }
}

export default OpsDialogPrompts;
