import Response from '../helpers/responseHelper';
import GeneralValidator from './GeneralValidator';

class RouteValidator {
  static validateRouteBatchStatus(req, res, next) {
    const { body: { status } } = req;
    const acceptedStatus = ['Active', 'Inactive'];
    if (status && !acceptedStatus.includes(status)) {
      const message = 'status can either \'Active\' or \'Inactive\'.';
      return Response.sendResponse(res, 400, false, message);
    }
    next();
  }

  static validateRouteIdParam(req, res, next) {
    const { params: { routeId } } = req;
    if (!routeId || !GeneralValidator.validateNumber(routeId)) {
      const message = 'Please provide a positive integer value for routeId';
      return Response.sendResponse(res, 400, false, message);
    }
    next();
  }
}

export default RouteValidator;
