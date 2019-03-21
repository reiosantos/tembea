import InteractivePrompts from '../../../SlackPrompts/InteractivePrompts';
import LocationMapHelpers from '../../../../../helpers/googleMaps/locationsMapHelpers';
import travelTripHelper from './index';
import GoogleMapsError from '../../../../../helpers/googleMaps/googleMapsError';

export default class travelHelper {
  static async getPickupType(data) {
    const { pickup } = data;
    if (pickup !== 'Others') {
      return InteractivePrompts.openDestinationDialog();
    }
    const verifiable = await LocationMapHelpers
      .locationVerify(data, 'pickup', 'travel_trip');
    return verifiable;
  }

  static async getDestinationType(payload, respond) {
    const { submission: { destination } } = payload;
    if (destination !== 'Others') {
      const confirmDetails = await travelTripHelper.detailsConfirmation(payload, respond);
      return confirmDetails;
    }
    try {
      const verifiable = await LocationMapHelpers
        .locationVerify(payload.submission, 'destination', 'travel_trip');
      if (verifiable) respond(verifiable);
    } catch (err) {
      if (err instanceof GoogleMapsError && err.code === GoogleMapsError.UNAUTHENTICATED) {
        const confirmDetails = await travelTripHelper.detailsConfirmation(payload, respond);
        respond(confirmDetails);
      }
    }
  }
}
