import HomebaseValidator from '../HomebaseValidator';
import CountryHelper from '../../helpers/CountryHelper';
import Response from '../../helpers/responseHelper';
import HttpError from '../../helpers/errorHandler';
import HomeBaseHelper from '../../helpers/HomeBaseHelper';

describe('HomebaseValidator', () => {
  const req = {
    body: {
      countryId: '1',
      homebaseName: 'Nairobi',
      channel: 'U08UJK'
    },
    query: {
      countryId: 1,
      name: 'Nairobi',
      channel: 'U08UJK'
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

  describe('reqeust body validation', () => {
    it('test with invalid fields', () => {
      jest.spyOn(res, 'status');
      jest.spyOn(res, 'json');
      const invalidReq = {
        body: {
          channel: 1, countryId: 'abc', homebaseName: 78
        }
      };
      HomebaseValidator.validateHomeBase(invalidReq, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          channel: '"channel" must be a string',
          countryId: 'countryId should be a number',
          homebaseName: '"homebaseName" must be a string'
        },
        message: 'Validation error occurred, see error object for details',
        success: false
      });
    });

    it('test with valid fields', () => {
      HomebaseValidator.validateHomeBase(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('test validateCountryExists', () => {
    let countryExistSpy;
    beforeEach(() => {
      countryExistSpy = jest.spyOn(CountryHelper, 'checkIfCountryExistsById');
    });

    it('test when country exists', async () => {
      countryExistSpy.mockResolvedValue(true);
      await HomebaseValidator.validateCountryExists(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test when country does not exist', async () => {
      const message = 'The country with Id: \'1\' does not exist';
      countryExistSpy.mockResolvedValue(null);
      await HomebaseValidator.validateCountryExists(req, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, message);
    });
  });

  describe('validateHomeBaseExists', () => {
    let homeBaseSpy;
    const request = {
      body: { homebaseId: undefined },
      params: { id: 1 }
    };

    beforeEach(() => {
      homeBaseSpy = jest.spyOn(HomeBaseHelper, 'checkIfHomeBaseExists');
    });

    it('should return null if homebase  does not exist', async () => {
      homeBaseSpy.mockResolvedValue(null);
      const message = 'The HomeBase with Id: \'1\' does not exist';

      await HomebaseValidator.validateHomeBaseExists(request, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, message);
    });

    it('should call next if homebase  exist', async () => {
      homeBaseSpy.mockResolvedValue({ id: 1, name: 'Uganda' });
      await HomebaseValidator.validateHomeBaseExists(request, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should validate edit homebase request body', () => {
      jest.spyOn(res, 'status');
      jest.spyOn(res, 'json');
      const invalidReq = {
        body: {
          homebaseName: 1
        }
      };
      HomebaseValidator.validateUpdateHomeBase(invalidReq, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: { homebaseName: '"homebaseName" must be a string' },

        message: 'Validation error occurred, see error object for details',
        success: false
      });
    });
  });

  describe('validateHomeBaseIdQueryParam', () => {
    const request = {
      params: { id: 'iii' }
    };
    beforeEach(() => {
      jest.spyOn(res, 'status');
      jest.spyOn(res, 'json');
    });
    it('should validate homebase id in query param', () => {
      HomebaseValidator.validateHomeBaseIdQueryParam(request, res, next);
      expect(HttpError.sendErrorResponse)
        .toHaveBeenCalled();
      expect(res.status)
        .toHaveBeenCalledWith(400);
      expect(res.json)
        .toHaveBeenCalledWith({
          message: 'Please provide a positive integer value for homebase Id',
          success: false
        });
    });
    it('should call next if homebase id in query param is valid', () => {
      request.params.id = 1;
      HomebaseValidator.validateHomeBaseIdQueryParam(request, res, next);
      expect(HttpError.sendErrorResponse).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});
