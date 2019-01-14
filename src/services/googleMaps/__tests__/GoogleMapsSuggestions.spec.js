import request from 'request-promise-native';
import GoogleMapsSuggestions from '../GoogleMapsSuggestions';
import GoogleMapsSuggestionsMock from '../__mocks__/GoogleMapsSuggestionsMock';
import bugsnagHelper from '../../../helpers/bugsnagHelper';

describe('GoogleMapSuggestions Helper', () => {
  it('should get suggestions for an input address', async () => {
    const response = [
      { location: 'location1' },
      { location: 'location2' }
    ];

    request.get = jest.fn().mockResolvedValue(JSON.stringify(response));

    const result = await GoogleMapsSuggestions.getPlacesAutoComplete(GoogleMapsSuggestionsMock);
    expect(result).toEqual(response);
  });
  
  it('should throw an error when reponse has error_message', async () => {
    const response = {
      error_message: 'Error found'
    };
    
    request.get = jest.fn().mockResolvedValue(JSON.stringify(response));
    bugsnagHelper.log = jest.fn().mockReturnValue({});
    await GoogleMapsSuggestions.getPlacesAutoComplete('xxxx');
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});
