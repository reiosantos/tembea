import CabsValidator from '../CabsValidator';
import {
  correctReq, incompleteReq, invalidPhoneNoReq, invalidCapacityReq,
  emptySpacesReq, invalidLocationReq, errorMessages, invalidPhoneNoErr,
  invalidCapacityErr, emptyInputErr, invalidLocationErr
} from '../__mocks__/CabsValidatorMocks';
import HttpError from '../../helpers/errorHandler';


describe('CabsValidator', () => {
  let res;
  let next;
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
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidPhoneNoErr, res);
      const response = await CabsValidator.checkInputValuesValidity(invalidPhoneNoReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(invalidPhoneNoErr);
    });

    it('should return capacity should be a number greater than zero', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidCapacityErr, res);
      const response = await CabsValidator.checkInputValuesValidity(invalidCapacityReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(invalidCapacityErr);
    });

    it('should return Location cannot include numbers', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(invalidLocationErr, res);
      const response = await CabsValidator.checkInputValuesValidity(invalidLocationReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(invalidLocationErr);
    });

    it('should return empty inputs errors', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(emptyInputErr, res);
      const response = await CabsValidator.validateAllInputs(emptySpacesReq, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(response).toEqual(emptyInputErr);
    });
  });
});
