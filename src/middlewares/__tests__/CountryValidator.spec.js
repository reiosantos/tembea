import CountryValidator from '../CountryValidator';
import GeneralValidator from '../GeneralValidator';
import HttpError from '../../helpers/errorHandler';
import CountryHelper from '../../helpers/CountryHelper';
import Response from '../../helpers/responseHelper';
import mockDeletedCountry from '../__mocks__/CountryValidatorMocks';

describe('CountryValidator', () => {
  let validateEmptyReqBodySpy;
  let res;
  let validReq;
  let invalidRequest;
  let next;
  let error = [];
  let req;
  let message;
  let validateStringSpy;
  let validateReqBodySpy;

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
    validateEmptyReqBodySpy = jest.spyOn(GeneralValidator, 'validateEmptyReqBodyProp');
    validateReqBodySpy = jest.spyOn(GeneralValidator, 'validateReqBody');
  });
  afterEach((done) => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    done();
  });

  describe('validateCountryReqBody', () => {
    it('test with valid request data', () => {
      validateEmptyReqBodySpy.mockReturnValue(error);
      CountryValidator.validateCountryReqBody(validReq, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test with invalid request data', () => {
      error = ['Country name must be supplied'];
      validateEmptyReqBodySpy.mockReturnValue(error);
      CountryValidator.validateCountryReqBody(invalidRequest, res, next);
      expect(validateEmptyReqBodySpy).toHaveBeenCalledWith(invalidRequest.body, 'name');
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false, error);
    });
  });

  describe('validateCountryName', () => {
    beforeEach(() => {
      req = { body: { name: 'Kenya#' } };
      message = 'Please provide a valid country name';
      validateStringSpy = jest.spyOn(CountryHelper, 'validateString');
    });

    it('test with valid country name', () => {
      validateStringSpy.mockReturnValue(true);
      CountryValidator.validateCountryName(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test with invalid country name', () => {
      validateStringSpy.mockReturnValue(false);
      CountryValidator.validateCountryName(req, res, next);
      expect(validateStringSpy).toHaveBeenCalledWith('Kenya#');
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false, message);
    });
  });

  describe('validateNewCountry', () => {
    beforeEach(() => {
      req = { body: { newName: 'Kenya#' } };
      message = 'Please provide a valid country name';
      validateStringSpy = jest.spyOn(CountryHelper, 'validateString');
    });

    it('test with valid country name', () => {
      validateStringSpy.mockReturnValue(true);
      CountryValidator.validateNewCountry(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test with invalid country name', () => {
      validateStringSpy.mockReturnValue(false);
      CountryValidator.validateNewCountry(req, res, next);
      expect(validateStringSpy).toHaveBeenCalledWith('Kenya#');
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false, message);
    });
  });

  describe('validateNameQueryParam', () => {
    beforeEach(() => {
      req = { query: { name: '#Kenya' } };
      validateStringSpy = jest.spyOn(CountryHelper, 'validateString');
      message = 'Please provide a valid string value for the country name';
    });

    it('test with valid query param', () => {
      validateStringSpy.mockReturnValue(true);
      CountryValidator.validateNameQueryParam(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test with invalid query param', () => {
      validateStringSpy.mockReturnValue(false);
      CountryValidator.validateNameQueryParam(req, res, next);
      expect(validateStringSpy).toHaveBeenCalledWith('#Kenya');
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false, message);
    });
  });

  describe('validateUpdateReqBody', () => {
    beforeEach(() => {
      error = ['Property `name` cannot be empty'];
      req = { body: { name: '', newName: 'Kenya' } };
      message = `Incomplete update information. 
    Compulsory properties; name and newName must be filled`;
    });

    it('test with valid request body', () => {
      req = { body: { name: 'Uganda', newName: 'Kenya' } };
      validateReqBodySpy.mockReturnValue([]);
      CountryValidator.validateUpdateReqBody(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('test with request body missing name/newName', () => {
      validateReqBodySpy.mockReturnValue(error);
      CountryValidator.validateUpdateReqBody(req, res, next);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false, message);
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
