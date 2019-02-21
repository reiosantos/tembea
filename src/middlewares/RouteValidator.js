import Response from '../helpers/responseHelper';
import GeneralValidator from './GeneralValidator';
import RouteHelper from '../helpers/RouteHelper';

class RouteValidator {
  static validateRouteBatchStatus(req, res, next) {
    const { body: { status } } = req;
    const acceptedStatus = ['Active', 'Inactive'];
    if (status && !acceptedStatus.includes(status)) {
      const message = 'status can either \'Active\' or \'Inactive\'.';
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  static validateRouteIdParam(req, res, next) {
    const {
      params: {
        routeBatchId,
        routeId
      },
      route: {
        path
      }
    } = req;
    if (path === '/routes/:routeBatchId') RouteValidator.validateIdParam(res, routeBatchId, 'routeBatchId', next);
    if (path === '/routes/:routeId') RouteValidator.validateIdParam(res, routeId, 'routeId', next);
  }

  static validateIdParam(res, id, name, next) {
    if (!id || !GeneralValidator.validateNumber(id)) {
      const message = `Please provide a positive integer value for ${name}`;
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  static verifyAllPropsExist(req, res, next) {
    const missingProps = RouteHelper.checkRequestProps(req.body);
    const message = `The following fields are missing: ${missingProps.slice(2)}`;

    if (missingProps.length) {
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  static verifyPropsValuesAreSetAndValid(req, res, next) {
    const errors = RouteHelper.verifyPropValues(req.body);
    const message = 'Your request contain errors';
    if (errors.length) {
      return Response.sendResponse(res, 400, false, message, errors);
    }
    return next();
  }

  static async validateDestinationAddress(req, res, next) {
    const { address } = req.body.destination;
    const message = 'Address already exists';
    const addressExists = await RouteHelper.checkThatAddressAlreadyExists(address);
    if (addressExists) {
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  static async validateDestinationCoordinates(req, res, next) {
    const { destination: { coordinates } } = req.body;
    const message = 'Provided coordinates belong to an existing address';
    const locationExists = await RouteHelper.checkThatLocationAlreadyExists(coordinates);
    if (locationExists) {
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }
}

export default RouteValidator;
