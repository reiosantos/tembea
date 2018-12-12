import {
  SlackDialogText, SlackDialogSelectElementWithOptions
} from '../../../modules/slack/SlackModels/SlackDialogModels';
import { pickupLocations, destinations } from '../../../utils/data';

export const toLabelValuePairs = arr => arr.map(val => ({
  label: val,
  value: val
}));

export default () => {
  const dateHint = `Enter date in Day/Month/Year format,
  leave a space and enter time in Hour:Minutes format. e.g 22/12/2018 22:00`;

  const pickupField = new SlackDialogSelectElementWithOptions('Pickup location',
    'pickup', toLabelValuePairs(pickupLocations));

  const destinationField = new SlackDialogSelectElementWithOptions('Destination',
    'destination', toLabelValuePairs(destinations));

  const othersPickupField = new SlackDialogText('Others?',
    'othersPickup', 'Enter pickup location', true);

  const othersDestinationField = new SlackDialogText('Others?',
    'othersDestination', 'Enter destination', true);

  const dateField = new SlackDialogText('Date and Time',
    'dateTime', 'dd/mm/yy hh:mm', false, dateHint);

  return [
    pickupField, othersPickupField, destinationField, othersDestinationField,
    dateField
  ];
};
