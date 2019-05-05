import HomebaseValidator from '../HomebaseValidator';
import DepartmentValidator from '../DepartmentValidator';
import CountryHelper from '../../helpers/CountryHelper';
import Response from '../../helpers/responseHelper';
import HomebaseHelper from '../../helpers/HomebaseHelper';


describe('HomebaseValidator', () => {
  let checkLengthSpy;
  let errors;
  let validatePropsSpy;

  const req = {
    body: {
      countryName: 'Kenya',
      homebaseName: 'Nairobi'
    },
    query: {
      country: 'Kenya',
      homebase: 'Nairobi'
    }
  };
  const res = {
    status() {
      return this;
    },
    json() {
      return this;
    }
  };
  const next = jest.fn();
  Response.sendResponse = jest.fn();

  beforeEach(() => {
    checkLengthSpy = jest.spyOn(DepartmentValidator, 'checkLengthOfMessageArray');
    validatePropsSpy = jest.spyOn(HomebaseHelper, 'validateProps');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('test validateNames', () => {
    it('test with invalid names', () => {
      errors = ['Please provide a valid string value for the field/param: \'countryName\' '];
      const invalidReq = {
        body: {
          countryName: 'Kenya1',
          homebaseName: 'Nairobi'
        }
      };
      HomebaseValidator.validateNames(invalidReq, res, next);
      expect(validatePropsSpy).toHaveBeenCalledWith(invalidReq.body, 'countryName', 'homebaseName');
      expect(checkLengthSpy).toHaveBeenCalledWith(errors, res, next);
    });

    it('test with valid names', () => {
      HomebaseValidator.validateNames(req, res, next);
      expect(validatePropsSpy).toHaveBeenCalledWith(req.body, 'countryName', 'homebaseName');
      expect(checkLengthSpy).toHaveBeenCalledWith([], res, next);
    });
  });

  describe('test validateCountryExists', () => {
    let countryExistSpy;
    beforeEach(() => {
      countryExistSpy = jest.spyOn(CountryHelper, 'checkIfCountryExists');
    });

    it('test when country exists', async () => {
      countryExistSpy.mockResolvedValue(true);
      await HomebaseValidator.validateCountryExists(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test when country does not exist', async () => {
      const message = 'The country with name: \'Kenya\' does not exist';
      countryExistSpy.mockResolvedValue(null);
      await HomebaseValidator.validateCountryExists(req, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, message);
    });
  });

  describe('test validatePassedQueryParams', () => {
    const invalidReq = {
      query: {
        name: 'nairob1',
      }
    };
    const errorMsg = ['Please provide a valid string value for the field/param: \'name\' '];
    it('test with invalid query params', () => {
      HomebaseValidator.validatePassedQueryParams(invalidReq, res, next);
      expect(validatePropsSpy).toHaveBeenCalledWith(invalidReq.query, 'country', 'name');
      expect(checkLengthSpy).toHaveBeenCalledWith(errorMsg, res, next);
    });
  });
});
