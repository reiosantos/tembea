import validator from 'validator';

import GeneralValidator from './GeneralValidator';

class DepartmentValidator {
  /**
   * @description This middleware checks for the required properties
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateUpdateBody(req, res, next) {
    const messages = GeneralValidator.validateReqBody(
      req.body,
      'newName',
      'newHeadEmail'
    );
    const hasName = GeneralValidator.validateReqBody(
      req.body,
      'name'
    );

    if (messages.length <= 1 && hasName.length === 0) {
      return next();
    }

    return res
      .status(400)
      .json({
        success: false,
        message: `Incomplete update information.
        Optional properties (at least one); newName or a newHeadEmail.
        Compulsory property; name.`
      });
  }

  /**
   * @description This middleware checks for empty properties
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateEmptyRequestBodyProps(req, res, next) {
    const errors = GeneralValidator.validateEmptyReqBodyProp(
      req.body,
      'name',
      'newName',
      'newHeadEmail'
    );
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors });
    }
    return next();
  }

  /**
   * @description This middleware checks if head of department email is valid
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateNewHeadEmail(req, res, next) {
    const email = req.body.newHeadEmail;
    if (email && !validator.isEmail(email.trim())) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Please provide a valid email'
        });
    }

    return next();
  }
}

export default DepartmentValidator;
