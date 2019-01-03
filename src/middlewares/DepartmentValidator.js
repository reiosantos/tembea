import validator from 'validator';
import GeneralValidator from './GeneralValidator';
import HttpError from '../helpers/errorHandler';

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

  static validateAddBody(req, res, next) {
    const messages = GeneralValidator.validateReqBody(
      req.body,
      'email',
      'name'
    );

    DepartmentValidator.checkLengthOfMessageArray(messages, res, next);
  }


  static validateDepartmentBody(req, res, next) {
    const { name } = req.body;
    const messages = DepartmentValidator.validateProps(name);

    DepartmentValidator.checkLengthOfMessageArray(messages, res, next);
  }

  static checkLengthOfMessageArray(messages, res, next) {
    return messages.length !== 0 ? res
      .status(400)
      .json({
        success: false,
        messages
      })
      : next();
  }

  static validateProps(name) {
    const messages = [];
    const expNameCha = /^[A-Za-z0-9_@./#&+-\s]{1,}$/;
    const nums = /^[0-9]+$/;
    const trimmedName = name.trim();
    if (name && !expNameCha.test(trimmedName)) {
      messages.push('Please provide a valid department name.');
    }
    if (name && nums.test(trimmedName)) {
      messages.push('Department cannot contain numeric values only.');
    }
    return messages;
  }

  /**
   * @description This method ensures the required parameter is present
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @param  {object} next The next middleware
   * @return {object} The http response object or the next middleware
   */
  static validateDeleteProps(req, res, next) {
    try {
      const { id, name } = req.body;
  
      if ((id && name)
        || (!id && !name)) {
        return res.status(400).json({
          success: false,
          message: 'Kindly provide one of the two; id or name'
        });
      }
  
      return next();
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description This method validates the passed parameters
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @param  {object} next The next middleware
   * @return {object} The http response object or the next middleware
   */
  static validateDeletePropsValues(req, res, next) {
    try {
      const { id, name } = req.body;
      const numRegex = /^[1-9][0-9]*$/;
      const wordRegex = /^[A-Za-z0-9- ]+$/;
  
      if (id && !numRegex.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Id can contain only positive integers'
        });
      }
      
      if (name && !wordRegex.test(name.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Name can contain only letters dashes and spaces'
        });
      }
  
      return next();
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default DepartmentValidator;
