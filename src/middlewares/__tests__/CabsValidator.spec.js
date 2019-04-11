import CabsValidator from '../CabsValidator';
import MockData from '../__mocks__/CabsValidatorMocks';
import HttpError from '../../helpers/errorHandler';


describe('CabsValidator', () => {
  let res;
  let next;
  const {
    correctReq, incompleteReq, invalidPhoneNoReq, invalidCapacityReq,
    emptySpacesReq, invalidLocationReq, errorMessages, invalidPhoneNoError,
    invalidCapacityError, invalidLocationError, emptyInputError, invalidReqParams,
    emptyUpdateBody, invalidParamsError, noInputsError, emptyValueInBody,
    noValueErrors, validUpdateBody, invalidInput
  } = MockData;
  beforeEach(() => {
    res = {
      status: jest.fn(() => ({
        json: jest.fn()
      }))
    };
    next = jest.fn();
    HttpError.sendErrorResponse = jest.fn();
  });

  afterEach((done) => {
    jest.restoreAllMocks();
    done();
  });

  describe('validateAllInputs', () => {
    it('should return next if there are no validation errors', async (done) => {
      await CabsValidator.validateAllInputs(correctReq, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      done();
    });

    it('should return errors if some inputs have been left out', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(errorMessages, res);
      const response = await CabsValidator.validateAllInputs(incompleteReq, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(errorMessages);
    });

    it('should return invalid phone number', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidPhoneNoError, res);
      const response = await CabsValidator.checkInputValuesValidity(invalidPhoneNoReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(invalidPhoneNoError);
    });

    it('should return capacity should be a number greater than zero', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidCapacityError, res);
      const response = await CabsValidator.checkInputValuesValidity(invalidCapacityReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(invalidCapacityError);
    });

    it('should return Location cannot include numbers', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidLocationError, res);
      const response = await CabsValidator.checkInputValuesValidity(invalidLocationReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(invalidLocationError);
    });

    it('should return empty inputs errors', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(emptyInputError, res);
      const response = await CabsValidator.validateAllInputs(emptySpacesReq, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(emptyInputError);
    });
  });
  describe('validateCabUpdateBody', () => {
    it('should validate Params', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidParamsError, res);
      const response = await CabsValidator.validateCabUpdateBody(invalidReqParams, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(invalidParamsError);
    });

    it('should validate InPuts', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(noInputsError, res);
      const response = await CabsValidator.validateCabUpdateBody(emptyUpdateBody, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(noInputsError);
    });

    it('should check empty input data', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(noValueErrors, res);
      const response = await CabsValidator.validateCabUpdateBody(emptyValueInBody, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(noValueErrors);
    });

    it('should skip checkInputValidity if Phone, capacity and location are null', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse');
      await CabsValidator.validateCabUpdateBody(validUpdateBody, res, next);
      expect(next).toBeCalled();
      expect(HttpError.sendErrorResponse).not.toBeCalled();
    });

    it('should validate validatePhoneLocationCapacity', () => {
      const req = {
        body: {
          driverPhoneNo: 'invalid',
          location: '123445',
          capacity: 'invalid'
        }
      };
      const response = CabsValidator.validatePhoneLocationCapacity(req);
      expect(response).toEqual({ isValid: false, checkValidPhoneNo: false, isValidLocation: false });
    });
  });

  describe('validateDeleteCabIdParam', () => {
    it('should return invalid cab id if number not used', async () => {
      const req = {
        params: {
          id: 'string'
        }
      };
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidInput, res);
      const result = await CabsValidator.validateDeleteCabIdParam(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(invalidInput);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return next', () => {
      const req = {
        params: {
          id: 7
        }
      };
      CabsValidator.validateDeleteCabIdParam(req, res, next);
      expect(HttpError.sendErrorResponse).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});
