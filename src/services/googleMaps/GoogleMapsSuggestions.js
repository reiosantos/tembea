import request from 'request-promise-native';
import bugsnagHelper from '../../helpers/bugsnagHelper';

export default class GoogleMapsSuggestions {
  static async getPlacesAutoComplete(placesSuggestionOptions) {
    const uri = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const options = {
      qs: placesSuggestionOptions
    };
    try {
      const response = await request.get(uri, options);
      const responseObject = JSON.parse(response);
      if (!responseObject.error_message) {
        return responseObject;
      }
      throw new Error(responseObject.error_message);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}
