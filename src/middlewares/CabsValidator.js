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
    CabsValidator.checkInputValuesValidity(req, res);
    next();
  }

  static checkInputValuesValidity(req, res) {
    const { body: { driverPhoneNo, capacity, location } } = req;
    const isValid = GeneralValidator.validateNumber(capacity);
    const checkValidPhoneNo = GeneralValidator.validatePhoneNo(driverPhoneNo);
    const isValidLocation = GeneralValidator.disallowNumericsAsValuesOnly(location);
    if (!isValid) {
      return HttpError.sendErrorResponse({
        message: { invalidInput: 'Capacity should be a number and greater than zero' }
      }, res);
    }
    if (!checkValidPhoneNo) {
      return HttpError.sendErrorResponse({
        message: { invalidInput: 'Use a valid phone number' }
      }, res);
    }
    if (!isValidLocation) {
      return HttpError.sendErrorResponse({
        message: { invalidInput: 'Location cannot include numbers' }
      }, res);
    }
  }
}

export default CabsValidator;
