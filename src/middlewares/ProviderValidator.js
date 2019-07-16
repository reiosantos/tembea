import joi from '@hapi/joi';
import GeneralValidator from './GeneralValidator';
import Response from '../helpers/responseHelper';
import UserService from '../services/UserService';
import ProviderService, { providerService } from '../services/ProviderService';
import HttpError from '../helpers/errorHandler';

class ProviderValidator {
  /**
   * @description validate provider update body middleware
   * @returns errors or calls next
   * @example ProviderService.updateProvider(req,res,next);
   * @param req
   * @param res
   * @param next
   */
  static async verifyProviderUpdateBody(req, res, next) {
    const { body, params: { id } } = req;
    await GeneralValidator.validateUpdateBody(id, body, res, ['name', 'email'], 2, next);
  }

  static async createUpdateBody(body) {
    const { email, name } = body;
    const updateData = {};
    if (email) {
      const user = await UserService.getUserByEmail(email.trim());
      if (!user) return { message: 'User with email doesnt exist' };
      updateData.providerUserId = user.dataValues.id;
    }
    if (name) updateData.name = name.trim();
    return updateData;
  }

  /**
   * @description This middleware checks that a user exists
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */

  static async validateUserExistence(req, res, next) {
    const { body: { email } } = req;
    const val = email && !await UserService.getUserByEmail(email.trim());
    if (val) {
      const message = `The user with email: '${email}' does not exist`;
      return Response.sendResponse(res, 404, false, message);
    }
    return next();
  }

  /**
   * @description This middleware validates an email address passed in the request
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */
  static validateReqBody(req, res, next) {
    let schema;
    schema = joi.object().keys({
      email: joi.string().trim().email().required(),
      name: joi.string().trim().required(),
      isDirectMessage: joi.boolean(),
      channelId: joi.string().alphanum().trim().allow(null, ''),
    }).with('channelId', 'isDirectMessage');
    if (req.method === 'PATCH') {
      schema = joi.object().keys({
        email: joi.string().trim().email(),
        name: joi.string().trim()
      }).min(1);
    }

    const { error, value } = joi.validate(req.body, schema, { abortEarly: false });

    if (error) {
      const validationError = HttpError.formatValidationError(error);
      return HttpError.sendErrorResponse(validationError, res);
    }
    req.body = value;
    return next();
  }

  /**
   * @description This middleware create driver body passed in the request
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */
  static validateDriverRequestBody(req, res, next) {
    const errorArray = [];
    const schema = joi.object().keys({
      driverPhoneNo: joi.number().required().min(3),
      driverName: joi.string().trim().required(),
      driverNumber: joi.string().trim().required().min(3),
      providerId: joi.number().required(),
      email: joi.string().trim().email()
    });
    const { error, value } = joi.validate(req.body, schema, { abortEarly: false });
    if (error) {
      const errors = error.details;
      errors.forEach((err) => {
        errorArray.push(err.message);
      });
      return Response.sendResponse(res, 400, false, errorArray);
    }
    req.body = value;
    return next();
  }

  /**
   * @description This middleware validates existence of a provider by there id
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */
  static async validateProviderExistence(req, res, next) {
    const { body: { providerId } } = req;
    const provider = await ProviderService.findProviderByPk(providerId);
    if (!provider) {
      return Response.sendResponse(res, 404, false, 'Provider doesnt exist');
    }
    return next();
  }

  /**
   * @description Validates if the providerId is a positive integer
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */
  static validateQueryProvider(req, res, next) {
    const { providerId } = req.query;

    if (
      (providerId && !GeneralValidator.validateNumber(providerId))
    ) {
      return Response.sendResponse(res, 404, false, 'Please provide a positive integer value for providerID');
    }
    return next();
  }

  /**
   * Validate the existence of a provider with given user id
   *
   * @static
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {object} next - Express next function
   * @returns {object} Returns an evaluated response
   * or calls the next middlware with the **providerData** object attached to the response scope
   * @memberof ProviderValidator
   */
  static async validateProvider(req, res, next) {
    const { body: { email, ...providerData } } = req;
    const { id: userId } = await UserService.getUserByEmail(email);
    const isExistingProvider = await providerService.findProviderByUserId(userId);

    if (isExistingProvider) {
      return Response.sendResponse(
        res, 409, false, `Provider with email '${email}' already exists`
      );
    }
    providerData.providerUserId = userId;
    res.locals = { providerData };
    return next();
  }
}

export default ProviderValidator;
