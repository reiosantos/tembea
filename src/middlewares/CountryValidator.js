import GeneralValidator from './GeneralValidator';
import CountryHelper from '../helpers/CountryHelper';
import { countrySchema, updateCountrySchema } from './ValidationSchemas';
import Response from '../helpers/responseHelper';

class CountryValidator {
  /**
     * @description This middleware validates the request body for creating a new country
     * @param  {object} req The HTTP request sent
     * @param  {object} res The HTTP response object
     * @param  {function} next The next middleware
     * @return {any} The next middleware or the http response
     */

  static validateCountryReqBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, countrySchema);
  }
  /**
     * @description This middleware checks if a country already exists in the database
     * @param  {object} req The HTTP request sent
     * @param  {object} res The HTTP response object
     * @param  {function} next The next middleware
     * @return {any} The next middleware or the http response
     */

  static async validateCountryExistence(req, res, next) {
    if (!req.query.action) {
      const { body: { name } } = req;
      const message = `Country named: '${name}' is not listed globally`;
      const countryExists = await CountryHelper.checkCountry(name);
      if (countryExists === false) {
        return Response.sendResponse(res, 404, false, message);
      }
    }
    return next();
  }

  /**
   * @description This middleware checks if a country with name/id passed in req.body exists
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */
  static async validateNamedCountryExists(req, res, next) {
    let message;
    if (!req.query.action) {
      const { body: { name, id } } = req;
      const countryExists = await CountryHelper.checkIfCountryExists(name, id);
      message = `Country with name: '${name}' does not exist`;
      if (!req.body.name) {
        message = `Country with id: '${id}' does not exist`;
      }
      if (countryExists == null) {
        return Response.sendResponse(res, 404, false, message);
      }
      return next();
    }
    return next();
  }

  /**
   * @description This middleware sets a country's status to active if it was deleted
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {next} The next middleware
   */
  static async setToActiveIfDeleted(req, res, next) {
    const { body: { name } } = req;
    const country = await CountryHelper.validateIfCountryIsDeleted(name);
    if (country !== null) {
      country.status = 'Active';
      await country.save();
    }
    return next();
  }

  /**
   * @description This middleware checks if a country s' name exists
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */
  static async validateIfCountryNameIsTaken(req, res, next) {
    const { body: { newName } } = req;
    const emptyName = GeneralValidator.isEmpty(newName);
    if (!emptyName) {
      const message = `The country name: '${newName}' is already taken`;
      const countryExists = await CountryHelper.checkIfCountryExists(newName);
      if (!countryExists) {
        return next();
      }
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  /**
   * @description This middleware validates thee request body of a PUT request
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */
  static validateUpdateReqBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, updateCountrySchema);
  }
}

export default CountryValidator;
