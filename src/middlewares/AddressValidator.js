import AddressService from '../services/AddressService';
import LocationService from '../services/LocationService';
import { newAddressSchema, updateAddressSchema } from './ValidationSchemas';
import GeneralValidator from './GeneralValidator';
import Response from '../helpers/responseHelper';

class AddressValidator {
  /**
   * @description This middleware checks for the required properties
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateAddressBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, newAddressSchema);
  }

  /**
   * @description This middleware checks for the required properties
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateAddressUpdateBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, updateAddressSchema);
  }

  static async validateLocation(req, res, next) {
    const longitude = req.body.longitude || req.body.newLongitude;
    const latitude = req.body.latitude || req.body.newLatitude;
    const location = await LocationService.findLocation(longitude, latitude);
    if (location) {
      const message = 'This location has been used already by an existing address';
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  static async validateaddress(req, res, next) {
    const { address } = req.body;
    const place = await AddressService.findAddress(address);
    if (place) {
      const message = 'Address already exists';
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  static async validateUpdateaddress(req, res, next) {
    const { address } = req.body;
    const place = await AddressService.findAddress(address);
    if (!place) {
      const message = 'Address does not exist';
      return Response.sendResponse(res, 404, false, message);
    }
    return next();
  }
}

export default AddressValidator;
