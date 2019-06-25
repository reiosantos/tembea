import GeneralValidator from './GeneralValidator';
import HttpError from '../helpers/errorHandler';
import { newCabSchema, updateCabSchema } from './ValidationSchemas';

class CabsValidator {
  static validateAllInputs(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, newCabSchema);
  }

  static async validateCabUpdateBody(req, res, next) {
    return GeneralValidator
      .joiValidation(req, res, next, { ...req.params, ...req.body }, updateCabSchema, true);
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
