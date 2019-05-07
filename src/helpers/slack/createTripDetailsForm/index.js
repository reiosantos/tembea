import {
  SlackDialogText,
  SlackDialogSelectElementWithOptions,
  SlackDialogElementWithDataSource, SlackDialogTextarea
} from '../../../modules/slack/SlackModels/SlackDialogModels';
import { pickupLocations, destinations, extraTravelOptions } from '../../../utils/data';

export const toLabelValuePairs = arr => arr.map(val => ({
  label: val,
  value: val
}));

const addressHint = 'e.g: Jomo Kenyatta Airport';

const dateHint = `Enter date in Day/Month/Year format,
    leave a space and enter time in Hour:Minutes format. e.g 22/12/2019 22:00`;

const travelPickupLocations = [...pickupLocations, ...extraTravelOptions];
const travelDestinations = [...destinations, ...extraTravelOptions];

const createTripDetailsForm = {
  regularTripForm: () => {
    const pickupField = new SlackDialogSelectElementWithOptions('Pickup location',
      'pickup', toLabelValuePairs(pickupLocations));

    const othersPickupField = new SlackDialogText('Others?',
      'othersPickup', 'Enter pickup location', true);

    const dateField = new SlackDialogText('Date and Time',
      'dateTime', 'dd/mm/yy hh:mm', false, dateHint);

    return [
      dateField,
      pickupField,
      othersPickupField,
    ];
  },

  tripDestinationLocationForm: () => {
    const destinationField = new SlackDialogSelectElementWithOptions('Destination',
      'destination', toLabelValuePairs(destinations));
    const othersDestinationField = new SlackDialogText('Others?',
      'othersDestination', 'Enter destination', true);
    return [
      destinationField,
      othersDestinationField,
    ];
  },
  travelTripContactDetailsForm: () => {
    const forWho = new SlackDialogElementWithDataSource('For Who?', 'rider');

    const noOfPassengers = new SlackDialogText(
      'Number of Passengers', 'noOfPassengers',
      'Enter the total number of passengers', false, 'e.g 2'
    );

    const riderPhoneNo = new SlackDialogText(
      'Passenger phone number', 'riderPhoneNo',
      'Enter Passenger\'s phone number', false, 'e.g 0717665593'
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
      'Flight Number', 'flightNumber', 'Enter flight number', false,
    );

    const flightDateTime = new SlackDialogText(
      'Flight Date and Time', 'flightDateTime', 'dd/mm/yy hh:mm', false, dateHint
    );

    const pickupField = new SlackDialogSelectElementWithOptions('Pickup location',
      'pickup', toLabelValuePairs(travelPickupLocations));

    const pickupFieldOther = new SlackDialogText(
      'Other Pickup location', 'othersPickup', 'Enter pickup location', true, addressHint
    );
    return [
      flightNumber,
      flightDateTime,
      pickupField,
      pickupFieldOther
    ];
  },
  travelDestinationForm: () => {
    const destinationField = new SlackDialogSelectElementWithOptions('Destination',
      'destination', toLabelValuePairs(travelDestinations));

    const destinationFieldOther = new SlackDialogText(
      'Other Destination', 'othersDestination', 'Enter destination', true, addressHint
    );
    return [
      destinationField,
      destinationFieldOther
    ];
  },
  travelEmbassyDetailsForm: () => {
    const pickupField = new SlackDialogText('Pick up Location',
      'pickup', 'Enter pickup location', false);
    const destinationField = new SlackDialogText('Destination',
      'destination', 'Enter destination', false);
    const appointmentDateTime = new SlackDialogText(
      'Interview Date and Time',
      'embassyVisitDateTime',
      'dd/mm/yy hh:mm',
      false,
      dateHint
    );

    const textarea = new SlackDialogTextarea('Reason', 'reason',
      'Enter reason for booking the trip');
    return [
      pickupField,
      destinationField,
      appointmentDateTime,
      textarea
    ];
  },
  travelTripNoteForm: (state) => {
    const textarea = new SlackDialogTextarea('Add Trip Note', 'tripNote',
      'Add Trip Notes', 'Eg. I always travel in First Class', state || ' ');
    return [
      textarea
    ];
  },
  riderLocationConfirmationForm: () => {
    const confirmedLocation = new SlackDialogText(
      'Riders location', 'confirmedLocation', 'Enter location', false, 'e.g Mirema Nairobi'
    );
    return [
      confirmedLocation
    ];
  }
};

export default createTripDetailsForm;
