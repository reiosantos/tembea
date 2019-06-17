import GeneralValidator from './GeneralValidator';
import HttpError from '../helpers/errorHandler';
import { driverService } from '../services/DriverService';
import { providerService } from '../services/ProviderService';

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
}

export default DriversValidator;
