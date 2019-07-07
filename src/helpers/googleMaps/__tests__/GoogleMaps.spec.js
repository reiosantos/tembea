import GoogleMapsService from '../../../services/googleMaps';
import googleMapsHelpers from '../index';

describe('GoogleMapsService', () => {
  let maps;
  beforeEach(() => {
    maps = new GoogleMapsService();
    maps.client.placesNearby = jest.fn(() => ({
      asPromise: jest.fn(() => ({
        json: {
          results: [
            { geometry: { location: {} }, name: 'first' },
            { geometry: { location: {} }, name: 'first' },
            { geometry: { location: {} }, name: 'second' },
            { geometry: { location: {} }, name: 'fast' }
          ]
        },
      }))
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findNearestBusStops', () => {
    it('should throw error on invalid location', () => {
      const mockCoordinates = jest.spyOn(googleMapsHelpers, 'coordinateStringToArray');
      expect(maps.findNearestBusStops('location')).rejects.toThrowError();
      expect(mockCoordinates).toHaveBeenCalledTimes(1);
    });

    it('should find nearest bus stops', () => {
      const mockCoordinates = jest.spyOn(googleMapsHelpers, 'coordinateStringToArray');
      expect(maps.findNearestBusStops('23,32')).resolves.toBeInstanceOf(Array);
      expect(mockCoordinates).toHaveBeenCalledTimes(1);
      expect(maps.findNearestBusStops('23,32')).resolves.toHaveLength(4);
      expect(mockCoordinates).toHaveBeenCalledTimes(2);
    });
    it('should map results to coordinates', async () => {
      const results = await maps.findNearestBusStops('23,32');
      const coords = GoogleMapsService.mapResultsToCoordinates(results);
      expect(coords).toHaveLength(4);
      expect(GoogleMapsService.generateMarkers(results)).toHaveLength(4);
    });
  });
});
