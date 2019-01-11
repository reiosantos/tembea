import request from 'request-promise-native';
import { getPayloadFromGoogleMaps } from '../../helpers/googleMaps/googleMapsHelpers';

export default class GoogleMapsReverseGeocode {
  static async getAddressDetails(type, payload) {
    const uri = 'https://maps.googleapis.com/maps/api/geocode/json?';
    const searchOption = type === 'placeId' ? {
      place_id: payload
    } : {
      latlng: payload
    };
    const options = {
      qs: {
        ...searchOption,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    };
    const response = await request.get(uri, options);
    return getPayloadFromGoogleMaps(response);
  }
}
