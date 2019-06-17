import GeneralValidator from './GeneralValidator';
import HttpError from '../helpers/errorHandler';

class CabsValidator {
  static validateAllInputs(req, res, next) {
    const inputErrors = GeneralValidator.validateReqBody(
      req.body, 'regNumber', 'capacity', 'model'
    );
    if (inputErrors.length > 0) {
      return HttpError.sendErrorResponse({ message: { inputErrors } }, res);
    }
    const { capacity } = req.body;
    const modifiedBodyData = { ...req.body };
    modifiedBodyData.capacity = (typeof capacity === 'number') ? `${capacity}` : capacity;
    const checkEmptyInputData = GeneralValidator.validateEmptyReqBodyProp(
      modifiedBodyData, 'regNumber', 'capacity', 'model',
    );
    if (checkEmptyInputData.length > 0) {
      return HttpError.sendErrorResponse({ message: { checkEmptyInputData } }, res);
    }
    CabsValidator.checkInputValuesValidity(req, res, next);
  }

  static checkInputValuesValidity(req, res, next) {
    const { isValid } = CabsValidator.validateCapacity(req);
    if (!isValid) {
      return HttpError.sendErrorResponse({
        message: { invalidInput: 'Capacity should be a number and greater than zero' },
        statusCode: 400

      }, res);
    }
    next();
  }

  static validateCapacity(req) {
    const { body: { capacity } } = req;
    const isValid = capacity ? GeneralValidator.validateNumber(capacity) : false;
    return { isValid };
  }

  static async validateCabUpdateBody(req, res, next) {
    const { body, params: { id } } = req;
    await GeneralValidator.validateUpdateBody(id, body, res,
      ['regNumber', 'capacity', 'model'], 3, next);
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
