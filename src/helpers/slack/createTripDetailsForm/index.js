import {
  SlackDialogText, SlackDialogSelectElementWithOptions
} from '../../../modules/slack/SlackModels/SlackDialogModels';
import { pickupLocations, destinations } from '../../../utils/data';

export default () => {
  const dateHint = `Enter date in Day/Month/Year format,
  leave a space and enter time in Hour:Minutes format. e.g 22/12/2018 22:00`;

  const pickupField = new SlackDialogSelectElementWithOptions('Pickup location', 'pickup');
  pickupField.addOptionsList(pickupLocations);

  const destinationField = new SlackDialogSelectElementWithOptions('Destination', 'destination');
  destinationField.addOptionsList(destinations);

  const othersPickupField = new SlackDialogText('Others?', 'othersPickup');
  othersPickupField.addOptionalProps('Enter pickup location', true);

  const othersDestinationField = new SlackDialogText('Others?', 'othersDestination');
  othersDestinationField.addOptionalProps('Enter destination', true);

  const dateField = new SlackDialogText('Date and Time', 'dateTime');
  dateField.addOptionalProps('dd/mm/yy hh:mm', false, dateHint);

  return [
    pickupField, othersPickupField, destinationField, othersDestinationField,
    dateField
  ];
};
