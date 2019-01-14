import request from 'request-promise-native';
import GoogleMapsReverseGeocode from '../GoogleMapsReverseGeocode';
import bugsnagHelper from '../../../helpers/bugsnagHelper';

describe('Test for GoogleMapReverseGeocode Helper', () => {
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
      error_message: 'Error found'
    };
    
    request.get = jest.fn().mockResolvedValue(JSON.stringify(response));
    bugsnagHelper.log = jest.fn().mockReturnValue({});
    await GoogleMapsReverseGeocode.getAddressDetails('xxxx');
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});
