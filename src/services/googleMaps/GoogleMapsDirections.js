import axios from 'axios';
import BugsnagHelper from '../../helpers/bugsnagHelper';

class GoogleMapsDirections {
  /**
   * @description This method gets the direction between two locations
   * @param  {string} origin The origin
   * @param  {string} destination The destination
   * @returns {Object} An object that contains the direction information from google
   */
  static async getDirections(origin, destination) {
    try {
      const key = process.env.GOOGLE_MAPS_API_KEY;
      const directionURL = 'https://maps.googleapis.com/maps/api/directions/json?';
      const response = await axios.get(directionURL, {
        params: {
          origin,
          destination,
          key
        }
      });
  
      return response.data;
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }
}

export default GoogleMapsDirections;
