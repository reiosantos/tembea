import Axios from 'axios';
import bugsnagHelper from '../../helpers/bugsnagHelper';

const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

class GoogleMapsDistanceMatrix {
  /**
   * @static async calculateDistance
   * @description This method queries the google api for the distance between two addresses
   * @param {string} origins - origin address (address could be the longitude/latitude)
   * e.g 'Epic Tower Lagos'
   * @param {string} destinations - destination address (address could be the longitude/latitude)
   * e.g 'Yaba lagos | Lekki lagos | -1.219539, 36.886215'
   * @returns {{distanceInKm: string, distanceInMetres: number }} distance between the two addresses
   * @memberof GoogleMapsDistanceMatrix
   */
  static async calculateDistance(origins, destinations) {
    try {
      const params = {
        origins,
        destinations,
        key: googleApiKey
      };
      const response = await Axios.get(
        'https://maps.googleapis.com/maps/api/distancematrix/json',
        { params }
      );
      if (response.data.status === 'REQUEST_DENIED') {
        return { distanceInKm: 'unknown', distanceInMetres: 'unknown' };
      }
      const element = response.data.rows[0].elements[0];
      if (element.status === 'ZERO_RESULTS') {
        return { distanceInKm: null, distanceInMetres: null };
      }
      const {
        distance: { text: distanceInKm, value: distanceInMetres }
      } = element;

      return { distanceInKm, distanceInMetres };
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }
}

export default GoogleMapsDistanceMatrix;
