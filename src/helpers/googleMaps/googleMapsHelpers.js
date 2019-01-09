import bugsnagHelper from '../bugsnagHelper';
import GoogleMapsDistanceMatrix from '../../services/googleMaps/GoogleMapsDistanceMatrix';

export class Marker {
  /**
   * @description Creats an instance of a google map marker
   * @returns {object} The marker array
   */
  constructor(color = 'blue', label = '') {
    this.color = color;
    this.label = label;
    this.locations = '';
  }

  /**
   * @description Add a location to a group of markers
   * @param  {string} location A confirmed google map recognised location
   */
  addLocation(location) {
    this.locations = this.locations.concat('|', location);
  }
}

export class RoutesHelper {
  /**
   * @static verifyDistanceBetweenBusStopAndHome
   * @description This method checks that the distance between bus-stop and home is <= 2KM
   * @param {string} busStop - the selected busStop
   * @param {string} home - the selected home   *
   * @returns {string} Accept or Reject message
   * @memberof RoutesHelper
   */

  static async distanceBetweenDropoffAndHome(busStop, home, limit = 2000) {
    try {
      const result = await RoutesHelper.verifyDistanceBetween(busStop, home, limit);
      if (!result) {
        return "Your Bus-stop can't more be than 2km away from your Home";
      }
      return 'Acceptable Distance';
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async verifyDistanceBetween(origins, destinations, limitInMetres) {
    const result = await GoogleMapsDistanceMatrix.calculateDistance(origins, destinations);
    const { distanceInMetres } = result;
    const acceptableDistanceInMetres = limitInMetres;
    if (distanceInMetres > acceptableDistanceInMetres) {
      return false;
    }
    return true;
  }
}
