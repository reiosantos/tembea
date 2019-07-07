import CabsValidator from '../CabsValidator';
import MockData from '../__mocks__/CabsValidatorMocks';
import HttpError from '../../helpers/errorHandler';
import GeneralValidator from '../GeneralValidator';
import { messages } from '../../helpers/constants';

const { VALIDATION_ERROR } = messages;

describe('CabsValidator', () => {
  let res;
  let next;
  const {
    correctReq, incompleteReq, invalidCapacityReq,
    emptySpacesReq, errorMessages, emptyValueInBody,
    invalidCapacityError, emptyInputError, invalidReqParams,
    invalidParamsError, noValueErrors, validUpdateBody, invalidInput
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
    it('should return next if there are no validation errors', async () => {
      await CabsValidator.validateAllInputs(correctReq, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return errors if some inputs have been left out', async () => {
      CabsValidator.validateAllInputs(incompleteReq, res, next);
      const error = new HttpError(VALIDATION_ERROR, 400, errorMessages);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledWith(error, res);
    });

    it('should return capacity should be a number greater than zero', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidCapacityError, res);
      const response = await CabsValidator.checkInputValuesValidity(invalidCapacityReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(invalidCapacityError);
    });

    it('should return empty inputs errors', async () => {
      CabsValidator.validateAllInputs(emptySpacesReq, res, next);
      const error = new HttpError(VALIDATION_ERROR, 400, emptyInputError);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledWith(error, res);
    });
  });
  describe('validateCabUpdateBody', () => {
    let validateUpdateBodySpy;
    beforeEach(() => {
      validateUpdateBodySpy = jest.spyOn(GeneralValidator, 'validateUpdateBody');
    });
    it('should validate Params', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidParamsError, res);
      await CabsValidator.validateCabUpdateBody(invalidReqParams, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(validateUpdateBodySpy).toBeCalled();
    });

    it('should check empty input data', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(noValueErrors, res);
      await CabsValidator.validateCabUpdateBody(emptyValueInBody, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(validateUpdateBodySpy).toBeCalled();
    });

    it('should skip checkInputValidity if Phone, capacity and location are null', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse');
      await CabsValidator.validateCabUpdateBody(validUpdateBody, res, next);
      expect(next).toBeCalled();
      expect(HttpError.sendErrorResponse).not.toBeCalled();
    });

    it('should validate validateCapacity', () => {
      const req = {
        body: {
          capacity: 'invalid'
        }
      };
      const response = CabsValidator.validateCapacity(req);
      expect(response).toEqual({ isValid: false });
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
