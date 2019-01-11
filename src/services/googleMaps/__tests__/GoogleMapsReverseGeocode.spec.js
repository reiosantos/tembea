import request from 'request-promise-native';
import GoogleMapsReverseGeocode from '../GoogleMapsReverseGeocode';

describe('GoogleMapReverseGeocode Helper', () => {
  describe('getAddressDetails', () => {
    it('should get address details from input', async () => {
      const response = [
        { address_details: 'test address details' }
      ];

      request.get = jest.fn().mockResolvedValue(JSON.stringify(response));

      const result = await GoogleMapsReverseGeocode.getAddressDetails('placeId', 'xxxx');
      expect(result).toEqual(response);
    });

    it('should throw an error when reponse has error_message', async () => {
      const response = {
        Error: 'Error found'
      };

      request.get = jest.fn().mockResolvedValue(JSON.stringify(response));
      try {
        await GoogleMapsReverseGeocode.getAddressDetails('placeId', 'xxxx');
      } catch (error) {
        expect(error).toEqual(response);
      }
    });
  });
});
