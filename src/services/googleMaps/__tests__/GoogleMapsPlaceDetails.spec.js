import request from 'request-promise-native';
import GoogleMapsPlaceDetails from '../GoogleMapsPlaceDetails';
import bugsnagHelper from '../../../helpers/bugsnagHelper';

describe('Test for GoogleMapReverseGeocode Helper', () => {
  it('should get address details from input', async () => {
    const response = { place_details: 'test address details' };

    request.get = jest.fn().mockResolvedValue(JSON.stringify(response));

    const result = await GoogleMapsPlaceDetails.getPlaceDetails('xxxx');
    expect(result).toEqual(response);
  });
  
  it('should throw an error when reponse has error_message', async () => {
    const response = {
      error_message: 'Error found'
    };
    
    request.get = jest.fn().mockResolvedValue(JSON.stringify(response));
    bugsnagHelper.log = jest.fn().mockReturnValue({});
    await GoogleMapsPlaceDetails.getPlaceDetails('xxxx');
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});
