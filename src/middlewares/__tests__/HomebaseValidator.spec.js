import HomebaseValidator from '../HomebaseValidator';
import CountryHelper from '../../helpers/CountryHelper';
import Response from '../../helpers/responseHelper';
import HttpError from '../../helpers/errorHandler';


describe('HomebaseValidator', () => {
  const req = {
    body: {
      countryName: 'Kenya',
      homebaseName: 'Nairobi'
    },
    query: {
      country: 'Kenya',
      name: 'Nairobi'
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
    jest.spyOn(Response, 'sendResponse');
    jest.spyOn(HttpError, 'sendErrorResponse');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('test validateNames', () => {
    it('test with invalid names', () => {
      const invalidReq = {
        body: {
          countryName: 'Kenya1',
          homebaseName: 'Nairobi'
        }
      };
      HomebaseValidator.validateHomeBase(invalidReq, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalled();
    });

    it('test with valid names', () => {
      HomebaseValidator.validateHomeBase(req, res, next);
      expect(next).toHaveBeenCalled();
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
});
