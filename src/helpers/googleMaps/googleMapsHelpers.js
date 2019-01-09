import GoogleMapsClient from '@google/maps';
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
export class GoogleMapsLocationSuggestionOptions {
  /**
   * @description This method creates variables needed to get location suggestions from Google Maps.
   * Keeps the session token alive
   * @param {string} input Text string of location to search
   * @param {string} location Point around which you wish to retrieve place information.
   * Must be specified as latitude,longitude.
   * @param {string} radius Distance (in meters) within which to return place results.
   * Maximum is 50,000
   * @param {string} location Coordinates of the location the suggestions should be bias to
   * @returns {object} Parameters needed to get map suggestions and session token
   * @memberof RoutesHelper
   */
  constructor(input, location = '-1.219539, 36.886215', radius = 15000, strictBounds = true) {
    this.input = input;
    this.location = location;
    this.radius = radius;
    this.strictbounds = strictBounds;
    this.sessiontoken = GoogleMapsClient.util.placesAutoCompleteSessionToken();
    this.key = process.env.GOOGLE_MAPS_API_KEY;
  }
}
