import Response from '../helpers/responseHelper';
import { validateTime } from '../helpers/dateHelper';
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
    if (!req.query.action) {
      const missingProps = RouteHelper.checkRequestProps(req.body);
      const message = `The following fields are missing: ${missingProps.slice(2)}`;
      if (missingProps.length) {
        return Response.sendResponse(res, 400, false, message);
      }
      return next();
    }
    return next();
  }

  static verifyPropsValuesAreSetAndValid(req, res, next) {
    if (!req.query.action) {
      const errors = RouteHelper.verifyPropValues(req.body);
      const message = 'Your request contain errors';
      if (errors.length) {
        return Response.sendResponse(res, 400, false, message, errors);
      }
      return next();
    }
    return next();
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

  static async validateRouteBatchUpdateFields(req, res, next) {
    const { validateNumber } = GeneralValidator;
    const {
      body: {
        takeOff, batch: _batch, name: _name, capacity, inUse, regNumber: _regNumber
      }
    } = req;

    const [
      batch, name, regNumber
    ] = [_batch, _name, _regNumber].map(e => e && e.trim());

    let errors = [];
    const [cabExists, cabDetails] = await RouteHelper.checkThatVehicleRegNumberExists(regNumber);
    const [routeExists, route] = await RouteHelper.checkThatRouteNameExists(name);

    errors = [...errors, (capacity && !validateNumber(capacity) && ('capacity should be a positive integer'))];
    errors = [...errors, (inUse && !validateNumber(inUse)) && 'inUse should be a positive integer'];
    errors = [...errors, (takeOff && !validateTime(takeOff)) && 'takeOff should be a valid time format (hh:mm)'];
    errors = [...errors, (regNumber && !cabExists) && `No cab with reg number '${regNumber}' exists in the db`];
    errors = [...errors, (name && !routeExists) && `The route '${name}' does not exist in the db`];
    errors = errors.filter(e => !!e);

    if (errors.length) return Response.sendResponse(res, 400, false, errors);
    req.body.cabId = regNumber && cabDetails.id;
    req.body.routeId = name && route.id;
    req.body.batch = batch;
    next();
  }
}

export default RouteValidator;
