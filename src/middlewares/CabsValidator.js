import joi from '@hapi/joi';
import GeneralValidator from './GeneralValidator';
import HttpError from '../helpers/errorHandler';
import { messages } from '../helpers/constants';

const { VALIDATION_ERROR } = messages;

class CabsValidator {
  /**
   * A middleware that validates the cab id param
   *
   * @static
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {object} next - Express next function
   * @returns {object|function} Returns a response or calls the next middleware
   * @memberof CabsValidator
   */
  static validateIdParam(req, res, next) {
    const schema = joi.object().keys({
      id: joi.number().required().positive(),
    });
    const { error } = joi.validate(req.params, schema);
    if (error) {
      const { details: errorDetails } = error;
      const { message } = errorDetails[0];
      const validationError = new HttpError(VALIDATION_ERROR, 400, { message });
      return HttpError.sendErrorResponse(validationError, res);
    }
    return next();
  }

  static validateAllInputs(req, res, next) {
    const schema = joi.object().keys({
      model: joi.string().trim().required(),
      regNumber: joi.string().trim().required().min(3),
      capacity: joi.number().required().positive(),
      providerId: joi.number().required().positive(),
    });
    const { error, value } = joi.validate(req.body, schema, { abortEarly: false });
    if (error) {
      const { details: errorDetails } = error;
      const inputErrors = {};
      errorDetails.forEach((err) => {
        const { context: { key }, message } = err;
        inputErrors[key] = message;
      });
      const validationError = new HttpError(VALIDATION_ERROR, 400, inputErrors);
      return HttpError.sendErrorResponse(validationError, res);
    }
    req.body = value;
    return next();
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
