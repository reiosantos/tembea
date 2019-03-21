import InteractivePrompts from '../../../SlackPrompts/InteractivePrompts';
import LocationMapHelpers from '../../../../../helpers/googleMaps/locationsMapHelpers';
import travelTripHelper from './index';

export default class travelHelper {
  static async getPickupType(payload, respond) {
    const { submission: { pickup } } = payload;
    if (pickup !== 'Others') {
      InteractivePrompts.openDestinationDialog(respond);
    } else {
      await LocationMapHelpers.locationVerify(payload, respond, 'pickup', 'travel_trip');
    }
  }

  static async getDestinationType(payload, respond) {
    const { submission: { destination } } = payload;
    if (destination !== 'Others') {
      await travelTripHelper.detailsConfirmation(payload, respond);
    } else {
      await LocationMapHelpers.locationVerify(payload, respond, 'destination', 'travel_trip');
    }
  }
}
