import joi from '@hapi/joi';
import GeneralValidator from './GeneralValidator';
import Response from '../helpers/responseHelper';
import UserService from '../services/UserService';

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
      name: joi.string().trim().required()
    });
    if (req.method === 'PATCH') {
      schema = joi.object().keys({
        email: joi.string().trim().email(),
        name: joi.string().trim()
      }).min(1);
    }
    joi.validate(req.body, schema, (err) => {
      if (err) {
        const { message } = err.details[0];
        return Response.sendResponse(res, 400, false, message);
      }
      return next();
    });
  }
}

export default ProviderValidator;
