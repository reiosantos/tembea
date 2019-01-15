import GeneralValidator from './GeneralValidator';
import AddressService from '../services/AddressService';
import LocationService from '../services/LocationService';
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
    const messages = GeneralValidator.validateReqBody(req.body, 'longitude', 'latitude', 'address');

    if (messages.length === 0) {
      return next();
    }
    const message = 'Incomplete address information. '
      + 'Compulsory properties; address, latitude, longitude.';

    return Response.sendResponse(res, 400, false, message);
  }

  static validateAddressInfo(req, res, next) {
    const longitude = req.body.longitude || req.body.newLongitude;
    const latitude = req.body.latitude || req.body.newLatitude;
    let messages = [];

    messages = AddressValidator.validateProps(longitude, latitude, messages);
    if (messages.length > 0) {
      return Response.sendResponse(res, 400, false, messages);
    }

    return next();
  }

  /**
   * @description This middleware checks for the required properties
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateAddressUpdateBody(req, res, next) {
    const messages = GeneralValidator.validateReqBody(
      req.body,
      'newLongitude',
      'newLatitude',
      'newAddress'
    );
    const messages1 = GeneralValidator.validateReqBody(req.body, 'address');

    if (messages.length < 3 && messages1.length === 0) {
      return next();
    }
    const message = 'Incomplete update information.'
      + '\nOptional properties (at least one); newLongitude, newLatitude or a newAddress.'
      + '\nCompulsory property; address.';

    return Response.sendResponse(res, 400, false, message);
  }

  static validateProps(longitude, latitude, messages) {
    if (longitude) {
      AddressValidator.validateLongitudeLatitude(longitude, -180, 180, 'longitude', messages);
    }

    if (latitude) {
      AddressValidator.validateLongitudeLatitude(latitude, -86, 86, 'latitude', messages);
    }
    return messages;
  }

  static validateLongitudeLatitude(value, min, max, invalid, messages) {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(value) || (value < min || value > max)) {
      return messages.push(`Invalid ${invalid} should be between ${min} and ${max}`);
    }
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
