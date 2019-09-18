import GeneralValidator from './GeneralValidator';
import DriverService, { driverService } from '../services/DriverService';
import { providerService } from '../services/ProviderService';
import { updateDriverSchema } from './ValidationSchemas';
import Response from '../helpers/responseHelper';
import HttpError from '../helpers/errorHandler';
import UserService from '../services/UserService';

class DriversValidator {
  /**
   * A middleware that validates provider id and driver id
   *
   * @static
   * @param {object} req - Express Request object
   * @param {object} res- Express Response object
   * @param {Function} next - Express NextFunction
   * @returns {Function} Calls the next middleware or responds with validation error
   * @memberof DriversValidator
   */
  static validateProviderDriverIdParams(req, res, next) {
    const { params } = req;
    const validationErrors = DriversValidator.validateParams(params);

    if (validationErrors.length > 0) {
      const error = {
        message: validationErrors,
        statusCode: 400
      };
      return HttpError.sendErrorResponse(error, res);
    }
    return next();
  }

  /**
   * Validates that the given request params contains numeric values
   *
   * @static
   * @param {object} params - The request params object
   * @returns {Array} A list of error messages
   * @memberof DriversValidator
   */
  static validateParams(params) {
    const errors = [];
    Object.keys(params).map((key) => {
      if (key && !GeneralValidator.validateNumber(params[key])) {
        const message = `${key} must be a positive integer`;
        errors.push(message);
      }
      return true;
    });
    return errors;
  }

  /**
   * A middleware that ensures that a driver belongs to the given provider
   *
   * @static
   * @param {object} req - Express Request object
   * @param {object} res - Express Response object
   * @param {Function} next - Express NextFunction
   * @returns {object} Returns an evaluated response
   * or calls the next middlware with the **driver** object attached to the response scope
   * @memberof DriversValidator
   */
  static async validateIsProviderDriver(req, res, next) {
    const { params: { providerId, driverId } } = req;
    try {
      const provider = await providerService.getProviderById(providerId);
      const driver = await driverService.getDriverById(driverId);
      HttpError.throwErrorIfNull(provider, `Provider with id ${providerId} does not exist`);
      HttpError.throwErrorIfNull(driver, `Driver with id ${driverId} does not exist`);

      const isProviderDriver = await provider.hasDriver(driver);
      if (!isProviderDriver) {
        const errorPayload = {
          message: 'Sorry, driver does not belong to the provider',
          statusCode: 400,
        };
        return HttpError.sendErrorResponse(errorPayload, res);
      }
      res.locals = { driver };
    } catch (error) {
      return HttpError.sendErrorResponse(error, res);
    }
    next();
  }

  /**
   * @description validate driver update body middleware
   * @returns errors or calls next
   * @example DriversValidator.validateDriverUpdateBody(req,res,next);
   * @param req
   * @param res
   * @param next
   */
  static async validateDriverUpdateBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, updateDriverSchema);
  }

  /**
 * @description validate the initial existence of items given in the body
 * @returns errors or calls next
 * @example DriversValidator.validatePhoneNoAndNumberAlreadyExist(req,res,next);
 * @param req
 * @param res
 * @param next
 */
  static async validatePhoneNoAndNumberAlreadyExists(req, res, next) {
    const { driverPhoneNo, driverNumber, email } = req.body;
    const { params: { driverId } } = req;
    const existing = await DriverService.exists(email, driverPhoneNo, driverNumber, driverId);
    if (existing) {
      return Response.sendResponse(res, 400, false,
        'Driver with this driver number, email or phone number exists');
    }
    return next();
  }

  static async validateUserExistenceById(req, res, next) {
    const { body: { userId, email }, headers: { teamurl } } = req;
    let userByEmail;
    if (email) userByEmail = await UserService.getUserByEmail(email);

    if (!userId) {
      try {
        const user = userByEmail || await UserService.createUserByEmail(teamurl, email);
        req.body.userId = user.id;
        return next();
      } catch (error) {
        req.body.userId = null;
        return next();
      }
    }
    const user = await UserService.getUserById(userId);
    if (user) return next();
    return Response.sendResponse(res, 404, false, 'User not Found');
  }
}

export default DriversValidator;
