import Response from '../helpers/responseHelper';
import UserService from '../services/UserService';
import ProviderService, { providerService } from '../services/ProviderService';
import GeneralValidator from './GeneralValidator';
import { updateProviderSchema, newProviderSchema, newDriverSchema } from './ValidationSchemas';

class ProviderValidator {
  /**
   * @description validate request body for creating a provider
   * @returns errors or calls next
   * @param req
   * @param res
   * @param next
   */
  static validateNewProvider(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, newProviderSchema);
  }

  /**
   * @description validate provider update body middleware
   * @returns errors or calls next
   * @example ProviderService.updateProvider(req,res,next);
   * @param req
   * @param res
   * @param next
   */
  static verifyProviderUpdate(req, res, next) {
    return GeneralValidator
      .joiValidation(req, res, next, { ...req.params, ...req.body }, updateProviderSchema, true);
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
   * @description This middleware validates driver body passed in the request
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP response object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http response
   */
  static validateDriverRequestBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, newDriverSchema);
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
    const provider = await ProviderService.findByPk(providerId);
    if (!provider) {
      return Response.sendResponse(res, 404, false, 'Provider doesnt exist');
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
    const { id: userId } = await UserService.getUserByEmail(email, { plain: true });
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
