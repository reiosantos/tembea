import GeneralValidator from './GeneralValidator';
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
    return GeneralValidator.validateIdParam(req, res, next);
  }
}

export default CabsValidator;
