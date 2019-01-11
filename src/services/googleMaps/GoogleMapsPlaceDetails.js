import request from 'request-promise-native';
import { getPayloadFromGoogleMaps } from '../../helpers/googleMaps/googleMapsHelpers';

export default class GoogleMapsPlaceDetails {
  static async getPlaceDetails(placeId) {
    const uri = 'https://maps.googleapis.com/maps/api/place/details/json?';
    const options = {
      qs: {
        placeid: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    };
    const response = await request.get(uri, options);
    return getPayloadFromGoogleMaps(response);
  }
}
