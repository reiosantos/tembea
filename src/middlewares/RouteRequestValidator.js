import Response from '../helpers/responseHelper';
import GeneralValidator from './GeneralValidator';
import { approveRouteRequestSchema, declineRouteRequestSchema, dateRangeSchema } from './ValidationSchemas';
import JoiHelper from '../helpers/JoiHelper';

class RouteRequestValidator {
  /**
   * @description This validator ensures that the parameters are of the right type
   * @param  {Object} req The HTTP request object
   * @param  {Object} res The HTTP response object
   * @param  {function} next The next middleware
   */
  static validateParams(req, res, next) {
    if (!/^[1-9]\d*$/.test(req.params.requestId)) {
      return Response.sendResponse(res, 400, false, 'Request Id can only be a number');
    }

    return next();
  }

  /**
   * @description This method checks that the required parameters were provided
   * @param  {Object} req The HTTP request object
   * @param  {Object} res The HTTP res object
   * @param  {Function} next The next middleware
   */
  static validateRequestBody(req, res, next) {
    const { newOpsStatus } = req.body;
    if (newOpsStatus && newOpsStatus === 'approve') {
      return GeneralValidator.joiValidation(req, res, next, req.body, approveRouteRequestSchema);
    }
    return GeneralValidator.joiValidation(req, res, next, req.body, declineRouteRequestSchema);
  }

  static async validateRatingsStartEndDateAndLocalCountry(req, res, next) {
    // Validates ratings start and end date
    const validationResponse = JoiHelper.validateSubmission(req.query, dateRangeSchema);
    if (validationResponse.errorMessage) {
      return Response.sendResponse(res, 400, false, validationResponse);
    }
    next();
  }
}

export default RouteRequestValidator;
