import request from 'request-promise-native';
import { getPayloadFromGoogleMaps } from '../../helpers/googleMaps/googleMapsHelpers';

export default class GoogleMapsSuggestions {
  static async getPlacesAutoComplete(placesSuggestionOptions) {
    const uri = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const options = {
      qs: placesSuggestionOptions
    };
    const response = await request.get(uri, options);
    return getPayloadFromGoogleMaps(response);
  }
}
