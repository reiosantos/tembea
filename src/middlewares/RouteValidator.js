import Response from '../helpers/responseHelper';
import GeneralValidator from './GeneralValidator';
import RouteHelper from '../helpers/RouteHelper';
import JoiHelper from '../helpers/JoiHelper';
import {
  newRouteSchema,
  updateRouteSchema,
  deleteRouteSchema,
  dateRangeSchema
} from './ValidationSchemas';

class RouteValidator {
  static validateNewRoute(req, res, next) {
    if (req.query) {
      const { action, batchId } = req.query;
      if (action === 'duplicate' && parseInt(batchId, 10)) return next();
    }

    const validateRoute = JoiHelper.validateSubmission(req.body, newRouteSchema);
    if (validateRoute.errorMessage) {
      return Response.sendResponse(res, 400, false, validateRoute);
    }
    req.body = validateRoute;
    next();
  }

  static validateIdParam(res, id, name, next) {
    if (!id || !GeneralValidator.validateNumber(id)) {
      const message = `Please provide a positive integer value for ${name}`;
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  static validateRouteIdParam(req, res, next) {
    const {
      params: {
        routeBatchId,
        routeId,
        userId
      },
      route: {
        path
      }
    } = req;
    if (path === '/routes/:routeBatchId') RouteValidator.validateIdParam(res, routeBatchId, 'routeBatchId', next);
    if (path === '/routes/:routeId') RouteValidator.validateIdParam(res, routeId, 'routeId', next);
    if (path === '/routes/fellows/:userId') {
      RouteValidator.validateIdParam(res, userId, 'userId', next);
    }
  }

  static validateDelete(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, deleteRouteSchema);
  }

  static async validateDestinationAddress(req, res, next) {
    if (!req.query.action) {
      const { address } = req.body.destination;
      const message = 'Address already exists';
      const addressExists = await RouteHelper.checkThatAddressAlreadyExists(address);
      if (addressExists) {
        return Response.sendResponse(res, 400, false, message);
      }
      return next();
    }
    return next();
  }

  static async validateDestinationCoordinates(req, res, next) {
    if (!req.query.action) {
      const { destination: { coordinates } } = req.body;
      const message = 'Provided coordinates belong to an existing address';
      const locationExists = await RouteHelper.checkThatLocationAlreadyExists(coordinates);
      if (locationExists) {
        return Response.sendResponse(res, 400, false, message);
      }
      return next();
    }
    return next();
  }

  static validateRouteUpdate(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, updateRouteSchema);
  }

  static async validateRouteBatchUpdateFields(req, res, next) {
    const { validateNumber } = GeneralValidator;
    const {
      body: {
        batch, name, inUse, regNumber, providerId
      }
    } = req;

    let errors = [];
    const [cabExists, cabDetails] = await RouteHelper.checkThatVehicleRegNumberExists(regNumber);
    const [routeExists, route] = await RouteHelper.checkThatRouteNameExists(name);
    const [providerExists] = await RouteHelper.checkThatProviderIdExists(providerId);

    errors = [...errors, (inUse && !validateNumber(inUse)) && 'inUse should be a positive integer'];
    errors = [...errors, (regNumber && !cabExists) && `No cab with reg number '${regNumber}' exists in the db`];
    errors = [...errors, (name && !routeExists) && `The route '${name}' does not exist in the db`];
    errors = [...errors, (providerId && !providerExists) && `The provider with id '${providerId}' does not exist in the db`];
    errors = errors.filter((e) => !!e);

    if (errors.length) return Response.sendResponse(res, 400, false, errors);
    req.body.cabId = regNumber && cabDetails.id;
    req.body.routeId = name && route.id;
    req.body.batch = batch;
    next();
  }

  static validateDateInputForRouteRiderStatistics(req, res, next) {
    return GeneralValidator
      .joiValidation(req, res, next, req.query, dateRangeSchema);
  }
}

export default RouteValidator;
