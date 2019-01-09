import GoogleMapsDirections from './GoogleMapsDirections';
import { Marker } from '../../helpers/googleMaps/googleMapsHelpers';
import AddressService from '../AddressService';

class GoogleMapsStatic {
  /**
   * @description This method gets a screenshot of a location from google
   * @param  {Object[]} markers An array of markers
   * @param  {string} size A string for the image size default if (700x700)
   * @param  {string} zoom A number that represents the zoom scale
   * @returns The image URL
   */
  static getLocationScreenShotUrl(
    markers,
    size = '700x700',
    zoom = ''
  ) {
    const stringedMarkers = GoogleMapsStatic.generateQueryParams(markers);
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/staticmap?size=${size}${stringedMarkers}&zoom=${zoom}$&key=${apiKey}`;
    return url;
  }

  /**
   * @description Builds the query parameters as a string
   * @param  {Object[]} markers The markers to be converted to query params
   * @returns {string} A string of the markers
   */
  static generateQueryParams(markers) {
    let stringedMarkers = '';
    markers.forEach((item) => {
      const { color, label, locations } = item;
      stringedMarkers += (`&markers=color:${color}|label:${label}${locations}`);
    });

    return stringedMarkers;
  }

  /**
   * @description This method generates an image URL for the path between the Dojo and a drop off
   * Throws an exception if 'The Dojo' has not been added to DB
   * @param  {string} dropOffLocation Location of the drop off or the latitude and longitude
   * @param  {string} size The size of the image
   * @param  {string} zoom The zoom scale of the image
   * @param  {string} weight The weight of the path
   * @param  {string} color The color of the path
   * @return {string} The image URL
   */
  static async getPathFromDojoToDropOff(
    dropOffLocation,
    size = '700x700',
    zoom = '',
    weight = '5',
    color = 'red'
  ) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    // Get the Dojos location from service
    const theDojo = await AddressService.findAddress('The Dojo');
    if (!theDojo) {
      throw new Error('Cannot find the location The Dojo in the database');
    }
    const dojoLocation = `${theDojo.dataValues.location.latitude}, ${theDojo.dataValues.location.longitude}`;

    // Get directions between the two locations
    const directions = await GoogleMapsDirections.getDirections(dojoLocation, dropOffLocation);

    // Generate the locations markers
    const originMarker = new Marker('Blue', 'A');
    originMarker.addLocation(dojoLocation);
    const destinationMarker = new Marker('Blue', 'D');
    destinationMarker.addLocation(dropOffLocation);

    const markersString = GoogleMapsStatic.generateQueryParams([originMarker, destinationMarker]);

    // Generate the URL for the image showing the path between the two locations
    const path = encodeURI(directions.routes[0].overview_polyline.points);
    const url = `https://maps.googleapis.com/maps/api/staticmap?size=${size}${markersString}&path=weight:${weight}|color:${color}|enc:${path}&zoom=${zoom}$&key=${apiKey}`;

    return url;
  }
}

export default GoogleMapsStatic;
