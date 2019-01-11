import request from 'request-promise-native';
import GoogleMapsPlaceDetails from '../GoogleMapsPlaceDetails';

describe('GoogleMapReverseGeocode Helper', () => {
  describe('getPlaceDetails', () => {
    it('should get address details from input', async () => {
      const response = { place_details: 'test address details' };

      request.get = jest.fn().mockResolvedValue(JSON.stringify(response));

      const result = await GoogleMapsPlaceDetails.getPlaceDetails('xxxx');
      expect(result).toEqual(response);
    });

    it('should throw an error when response has error_message', async () => {
      const response = {
        Error: 'Error found'
      };

      request.get = jest.fn().mockResolvedValue(JSON.stringify(response));
      try {
        await GoogleMapsPlaceDetails.getPlaceDetails('xxxx');
      } catch (error) {
        expect(error).toEqual(response);
      }
    });
  });
});
