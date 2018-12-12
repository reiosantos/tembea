import {
  SlackDialogText,
  SlackDialogSelectElementWithOptions,
  SlackDialogElementWithDataSource
} from '../../../modules/slack/SlackModels/SlackDialogModels';
import { pickupLocations, destinations } from '../../../utils/data';

export const toLabelValuePairs = arr => arr.map(val => ({
  label: val,
  value: val
}));

const addressHint = 'e.g: Jomo Kenyatta Airport';

const dateHint = `Enter date in Day/Month/Year format,
    leave a space and enter time in Hour:Minutes format. e.g 22/12/2018 22:00`;

const createTripDetailsForm = {
  regularTripForm: () => {
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
  },
  travelTripContactDetailsForm: () => {
    const forWho = new SlackDialogElementWithDataSource('For Who?', 'rider');

    const noOfPassengers = new SlackDialogText(
      'Number of Passengers', 'noOfPassengers',
      'Enter the total number of passengers', false, 'e.g 2'
    );

    const riderPhoneNo = new SlackDialogText(
      'Rider phone number', 'riderPhoneNo',
      'Enter Rider phone number', false, 'e.g 0717665593'
    );

    const travelTeamPhoneNo = new SlackDialogText(
      'Travel team phone number', 'travelTeamPhoneNo',
      'Enter travel team phone number', false, 'e.g 0717665593'
    );

    return [
      forWho,
      noOfPassengers,
      riderPhoneNo,
      travelTeamPhoneNo
    ];
  },
  travelTripFlightDetailsForm: () => {
    const flightNumber = new SlackDialogText(
      'Flight Number', 'flightNumber',
      'Enter flight number', false,
    );

    const flightDateTime = new SlackDialogText(
      'Flight Date and Time', 'flightDateTime',
      'dd/mm/yy hh:mm', false, dateHint
    );

    const pickupField = new SlackDialogText(
      'Pickup location', 'pickup', 'Enter pickup location', false, addressHint
    );

    const destinationField = new SlackDialogText(
      'Destination', 'destination', 'Enter destination', false, addressHint
    );

    return [
      flightNumber,
      flightDateTime,
      pickupField,
      destinationField
    ];
  }
};

export default createTripDetailsForm;
