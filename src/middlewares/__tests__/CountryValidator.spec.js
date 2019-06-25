import CountryValidator from '../CountryValidator';
import GeneralValidator from '../GeneralValidator';
import HttpError from '../../helpers/errorHandler';
import CountryHelper from '../../helpers/CountryHelper';
import Response from '../../helpers/responseHelper';
import mockDeletedCountry from '../__mocks__/CountryValidatorMocks';

const errorMessage = 'Validation error occurred, see error object for details';

describe('CountryValidator', () => {
  let res;
  let validReq;
  let invalidRequest;
  let next;
  let req;
  let message;

  beforeEach(() => {
    res = {
      status: jest.fn(() => ({
        json: jest.fn()
      }))
    };
    validReq = {
      body: {
        name: 'Nigeria'
      }
    };

    invalidRequest = {
      body: {
        name: ''
      }
    };
    next = jest.fn();
    HttpError.sendErrorResponse = jest.fn();
    Response.sendResponse = jest.fn();
  });
  afterEach((done) => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    done();
  });

  describe('validateCountryReqBody', () => {
    it('test with valid request data', () => {
      CountryValidator.validateCountryReqBody(validReq, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test with invalid request data', () => {
      CountryValidator.validateCountryReqBody(invalidRequest, res, next);
      expect(HttpError.sendErrorResponse)
        .toHaveBeenCalledWith({
          statusCode: 400,
          message: errorMessage,
          error: { name: 'please provide a valid name' }
        }, res);
    });
  });

  describe('validateUpdateReqBody', () => {
    beforeEach(() => {
      req = { body: { name: '', newName: 'Kenya' } };
      message = 'name is not allowed to be empty\nplease provide a valid name\n';
    });

    it('test with valid request body', () => {
      req = { body: { name: 'Uganda', newName: 'Kenya' } };
      CountryValidator.validateUpdateReqBody(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test with request body missing name/newName', () => {
      CountryValidator.validateUpdateReqBody(req, res, next);
      expect(HttpError.sendErrorResponse)
        .toHaveBeenCalledWith({
          statusCode: 400,
          message: errorMessage,
          error: { name: 'please provide a valid name' }
        }, res);
    });
  });

  describe('validateCountryExistence', () => {
    let countryExistSpy;
    beforeEach(() => {
      req = { body: { name: 'Nigeria' }, query: { action: '' } };
      message = 'Country named: \'Nigeria\' is not listed globally';
      countryExistSpy = jest.spyOn(CountryHelper, 'checkCountry');
    });

    it('test when country exists', async () => {
      countryExistSpy.mockResolvedValue(true);
      await CountryValidator.validateCountryExistence(req, res, next);
      expect(countryExistSpy).toHaveBeenCalledWith(req.body.name);
      expect(next).toHaveBeenCalled();
    });

    it('test when country does not exist', async () => {
      countryExistSpy.mockResolvedValue(false);
      await CountryValidator.validateCountryExistence(req, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, message);
    });

    it('test when req.query.action is true', async () => {
      req = { body: { name: 'Nigeria' }, query: { action: 'doSomething' } };
      await CountryValidator.validateCountryExistence(req, res, next);
      expect(countryExistSpy).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateNamedCountryExists', () => {
    let countryExistSpy;
    beforeEach(() => {
      req = { body: { name: 'Nigeria' }, query: { action: '' } };
      message = `Country with name: '${req.body.name}' does not exist`;
      countryExistSpy = jest.spyOn(CountryHelper, 'checkIfCountryExists');
    });

    it('test when country exists', async () => {
      countryExistSpy.mockResolvedValue(true);
      await CountryValidator.validateNamedCountryExists(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test when country does not exist and id is passed', async () => {
      req = { body: { id: 1 }, query: { action: '' } };
      message = `Country with id: '${req.body.id}' does not exist`;
      countryExistSpy.mockResolvedValue(null);
      await CountryValidator.validateNamedCountryExists(req, res, next);
      expect(countryExistSpy).toHaveBeenCalledWith(undefined, req.body.id);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, message);
    });

    it('test when country does not exist and name is passed', async () => {
      countryExistSpy.mockResolvedValue(null);
      await CountryValidator.validateNamedCountryExists(req, res, next);
      expect(countryExistSpy).toHaveBeenCalledWith(req.body.name, undefined);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, message);
    });

    it('test when req.query.action is true', async () => {
      req = { body: { name: 'Nigeria' }, query: { action: 'doSomething' } };
      await CountryValidator.validateNamedCountryExists(req, res, next);
      expect(countryExistSpy).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateIfCountryNameIsTaken', () => {
    let countryExistSpy;
    let isEmptySpy;
    beforeEach(() => {
      req = { body: { newName: 'Nigeria' } };
      message = `The country name: '${req.body.newName}' is already taken`;
      isEmptySpy = jest.spyOn(GeneralValidator, 'isEmpty');
      countryExistSpy = jest.spyOn(CountryHelper, 'checkIfCountryExists');
    });

    it('test country name taken', async () => {
      isEmptySpy.mockReturnValue(false);
      countryExistSpy.mockResolvedValue(true);
      await CountryValidator.validateIfCountryNameIsTaken(req, res, next);
      expect(isEmptySpy).toHaveBeenCalledWith(req.body.newName);
      expect(countryExistSpy).toHaveBeenCalledWith(req.body.newName);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false, message);
    });

    it('test empty country name in request body', async () => {
      req = { body: { newName: ' ' } };
      isEmptySpy.mockResolvedValue(true);
      await CountryValidator.validateIfCountryNameIsTaken(req, res, next);
      expect(countryExistSpy).not.toHaveBeenCalled();
      expect(isEmptySpy).toHaveBeenCalledWith(req.body.newName);
      expect(next).toHaveBeenCalled();
    });

    it('test country does not exist', async () => {
      isEmptySpy.mockReturnValue(false);
      countryExistSpy.mockResolvedValue(false);
      await CountryValidator.validateIfCountryNameIsTaken(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });
  });

  describe('setToActiveIfDeleted', () => {
    let countryDeletedSpy;

    beforeEach(() => {
      req = { body: { name: 'Uganda' } };
      countryDeletedSpy = jest.spyOn(CountryHelper, 'validateIfCountryIsDeleted');
    });

    it('test country status is set to active', async () => {
      countryDeletedSpy.mockResolvedValue(mockDeletedCountry);
      await CountryValidator.setToActiveIfDeleted(req, res, next);
      expect(mockDeletedCountry.status).toBe('Active');
      expect(mockDeletedCountry.save).toHaveBeenCalled();
    });

    it('test when the return value is a null', async () => {
      countryDeletedSpy.mockResolvedValue(null);
      await CountryValidator.setToActiveIfDeleted(req, res, next);
      expect(countryDeletedSpy).toHaveBeenCalledWith(req.body.name);
      expect(next).toHaveBeenCalled();
    });
  });
});
