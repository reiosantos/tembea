import GeneralValidator from './GeneralValidator';
import HttpError from '../helpers/errorHandler';

class CabsValidator {
  static validateAllInputs(req, res, next) {
    const inputErrors = GeneralValidator.validateReqBody(
      req.body, 'driverName', 'driverPhoneNo', 'regNumber', 'capacity', 'model', 'location'
    );
    if (inputErrors.length > 0) {
      return HttpError.sendErrorResponse({ message: { inputErrors } }, res);
    }
    const { capacity } = req.body;
    const modifiedBodyData = { ...req.body };
    modifiedBodyData.capacity = (typeof capacity === 'number') ? `${capacity}` : capacity;
    const checkEmptyInputData = GeneralValidator.validateEmptyReqBodyProp(
      modifiedBodyData, 'driverName', 'driverPhoneNo', 'regNumber', 'capacity', 'model', 'location'
    );
    if (checkEmptyInputData.length > 0) {
      return HttpError.sendErrorResponse({ message: { checkEmptyInputData } }, res);
    }
    CabsValidator.checkInputValuesValidity(req, res, next);
  }

  static checkInputValuesValidity(req, res, next) {
    const { isValid, checkValidPhoneNo, isValidLocation } = CabsValidator.validatePhoneLocationCapacity(req);
    if (!isValid) {
      return HttpError.sendErrorResponse({
        message: { invalidInput: 'Capacity should be a number and greater than zero' },
        statusCode: 400

      }, res);
    }
    if (!checkValidPhoneNo) {
      return HttpError.sendErrorResponse({
        message: { invalidInput: 'Use a valid phone number' },
        statusCode: 400
      }, res);
    }
    if (!isValidLocation) {
      return HttpError.sendErrorResponse({
        message: { invalidInput: 'Location cannot include numbers' },
        statusCode: 400
      }, res);
    }
    next();
  }

  static validatePhoneLocationCapacity(req) {
    const { body: { driverPhoneNo, capacity, location } } = req;
    const isValid = capacity ? GeneralValidator.validateNumber(capacity) : true;
    const checkValidPhoneNo = driverPhoneNo ? GeneralValidator.validatePhoneNo(driverPhoneNo) : true;
    const isValidLocation = location ? GeneralValidator.disallowNumericsAsValuesOnly(location) : true;
    return { isValid, checkValidPhoneNo, isValidLocation };
  }

  static async validateCabUpdateBody(req, res, next) {
    const { body, params: { id } } = req;
    await GeneralValidator.validateUpdateBody(id, body, res,
      ['driverName', 'driverPhoneNo', 'regNumber', 'capacity', 'model', 'location'], 6, next);
  }

  static validateDeleteCabIdParam(req, res, next) {
    const { params: { id } } = req;
    if (!GeneralValidator.validateNumber(id)) {
      const invalidInput = {
        message: 'Please provide a positive integer value',
        statusCode: 400
      };
      return HttpError.sendErrorResponse(invalidInput, res);
    }
    return next();
  }
}

export default CabsValidator;
