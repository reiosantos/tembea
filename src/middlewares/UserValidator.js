import {
  userUpdateSchema, newUserSchema, assignRoleSchema, getRoleSchema, newRoleSchema
} from './ValidationSchemas';
import GeneralValidator from './GeneralValidator';

class UserValidator {
  /**
   * @description This middleware checks for the required properties for updating user infomation
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateUpdateBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, userUpdateSchema);
  }

  /**
   * @description This middleware checks for the required properties for creating a new user
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateNewBody(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, newUserSchema);
  }

  static validateAssignRole(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, assignRoleSchema);
  }

  static getUserRoles(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.query, getRoleSchema, false, true);
  }

  static validateNewRole(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, newRoleSchema);
  }
}

export default UserValidator;
