import GoogleClient from '@google/maps';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import googleMapsHelpers from '../../helpers/googleMaps';
import { Marker } from '../../helpers/googleMaps/googleMapsHelpers';

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

class GoogleMapsService {
  constructor() {
    this.client = GoogleClient.createClient({
      key: apiKey,
      Promise
    });
  }

  /**
   * @param {string} location(lat, lon)
   * @returns {Promise<jest.MockResult[] | Array | number | * | SpeechRecognitionResultList>}
   */
  async findNearestBusStops(location) {
    let data;
    try {
      data = await this.client.placesNearby({
        language: 'en',
        location: googleMapsHelpers.coordinateStringToArray(location),
        radius: 2000, // 2000Metres (2KM)
        keyword: '("matatu") OR ("taxi") OR ("stage") OR ("bus")'
      }).asPromise();

      return data.json.results;
    } catch (e) {
      bugsnagHelper.log(e);
      throw e;
    }
  }

  static mapResultsToCoordinates(results) {
    const data = results.map((point) => {
      const { geometry, name } = point;
      const { location } = geometry;

      const coordinate = `${location.lat},${location.lng}`;

      return { label: name, text: name, value: coordinate };
    });
    data.sort((a, b) => {
      if (a.text.toLowerCase() > b.text.toLowerCase()) return 1;
      if (a.text.toLowerCase() < b.text.toLowerCase()) return -1;
      return 0;
    });
    return data;
  }

  static generateMarkers(busStops) {
    // Loop and add Markers.
    return busStops.map((point) => {
      const { geometry, name } = point;
      const { location } = geometry;
      const marker = new Marker(undefined, name);
      marker.addLocation(`${location.lat},${location.lng}`);
      return marker;
    });
  }
}

export default GoogleMapsService;
