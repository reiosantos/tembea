import GeneralValidator from '../../middlewares/GeneralValidator';
import CountryHelper from '../CountryHelper';
import HomebaseHelper from '../HomebaseHelper';

describe('test HomebaseHelper', () => {
  let errors;
  let isEmptySpy;
  let validateStringSpy;
  beforeEach(() => {
    isEmptySpy = jest.spyOn(GeneralValidator, 'isEmpty');
    validateStringSpy = jest.spyOn(CountryHelper, 'validateString');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('test validateProps', () => {
    errors = ['Please provide a valid string value for the field/param: \'homebaseName\' '];
    const invalidReq = {
      body: {
        countryName: 'Kenya',
        homebaseName: '2233123'
      }
    };
    const message = HomebaseHelper.validateProps(invalidReq.body,
      'countryName', 'homebaseName');
    expect(isEmptySpy).toHaveBeenCalledWith(invalidReq.body.homebaseName);
    expect(validateStringSpy).toHaveBeenCalledWith(invalidReq.body.homebaseName);
    expect(message).toEqual(errors);
  });

  it('test with empty props', () => {
    errors = ['Invalid or empty key/value pair. Provide a valid key: \'countryName\' and value for the key.'];
    const invalidReq = {
      body: {
        homebaseName: 'Nairobi'
      }
    };
    const message = HomebaseHelper.validateProps(invalidReq.body,
      'countryName', 'homebaseName');
    expect(validateStringSpy).toHaveBeenCalledWith(invalidReq.body.homebaseName);
    expect(message).toEqual(errors);
  });
});
