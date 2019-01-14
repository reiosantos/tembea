import request from 'request-promise-native';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import { getGoogleLocationPayload } from '../../helpers/googleMaps/googleMapsHelpers';

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
    try {
      const response = await getGoogleLocationPayload(request, uri, options);
      return response;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}
