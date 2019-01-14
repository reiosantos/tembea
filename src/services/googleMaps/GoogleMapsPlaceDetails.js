import request from 'request-promise-native';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import { getGoogleLocationPayload } from '../../helpers/googleMaps/googleMapsHelpers';

export default class GoogleMapsPlaceDetails {
  static async getPlaceDetails(placeId) {
    const uri = 'https://maps.googleapis.com/maps/api/place/details/json?';
    const options = {
      qs: {
        placeid: placeId,
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
