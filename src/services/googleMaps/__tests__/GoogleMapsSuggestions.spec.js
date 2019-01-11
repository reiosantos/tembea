import request from 'request-promise-native';
import GoogleMapsSuggestions from '../GoogleMapsSuggestions';
import GoogleMapsSuggestionsMock from '../__mocks__/GoogleMapsSuggestionsMock';

describe('GoogleMapSuggestions Helper', () => {
  describe('getPlacesAutoComplete', () => {
    it('should get suggestions for an input address', async () => {
      const response = [
        { location: 'location1' },
        { location: 'location2' }
      ];

      request.get = jest.fn().mockResolvedValue(JSON.stringify(response));

      const result = await GoogleMapsSuggestions.getPlacesAutoComplete(GoogleMapsSuggestionsMock);
      expect(result).toEqual(response);
    });

    it('should throw an error when response has error_message', async () => {
      const response = {
        Error: 'Error found'
      };

      request.get = jest.fn().mockResolvedValue(JSON.stringify(response));
      try {
        await GoogleMapsSuggestions.getPlacesAutoComplete(GoogleMapsSuggestionsMock);
      } catch (error) {
        expect(error).toEqual(response);
      }
    });
  });
});
