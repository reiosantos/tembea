import validator from 'validator';
import GeneralValidator from './GeneralValidator';

class UserValidator {
  /**
   * @description This middleware validates the email address provided
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateEmail(req, res, next) {
    const email = req.body.email || '';

    if (!validator.isEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email for the user'
      });
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
  static validateUpdateBody(req, res, next) {
    const messages = GeneralValidator.validateReqBody(
      req.body,
      'newName',
      'newPhoneNo',
      'newEmail'
    );
    const messages1 = GeneralValidator.validateReqBody(req.body, 'slackUrl');

    if (messages.length < 3 && messages1.length === 0) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message:
        'Incomplete update information.'
        + '\nOptional properties (at least one); newName, newPhoneNo or a newEmail.'
        + '\nCompulsory property; slackUrl.'
    });
  }

  /**
   * @description This middleware checks the required properties for validity
   * @param  {object} req The HTTP request sent
   * @param  {object} res The HTTP responds object
   * @param  {function} next The next middleware
   * @return {any} The next middleware or the http responds
   */
  static validateUpdateInfo(req, res, next) {
    const {
      newName, newPhoneNo, newEmail, slackUrl
    } = req.body;
    const messages = [];

    const trimmedSlackUrl = UserValidator.validateProps(
      newName,
      messages,
      newPhoneNo,
      newEmail,
      slackUrl
    );

    if (messages.length > 0) {
      return res.status(400).json({ success: false, messages });
    }

    req.body.slackUrl = trimmedSlackUrl.trim();
    return next();
  }

  static validateProps(newName, messages, newPhoneNo, newEmail, slackUrl) {
    const expNameCha = /^[A-Za-z ,.'-]+$/;
    const nums = /^[0-9]+$/;
    const slackUrlRegex = /.+\.slack\.com$/;

    if (newName && !expNameCha.test(newName.trim())) {
      messages.push('Invalid newName.');
    }
    if (newPhoneNo && !nums.test(newPhoneNo.trim())) {
      messages.push('Invalid newPhoneNo.');
    }
    if (newEmail && !validator.isEmail(newEmail.trim())) {
      messages.push('Invalid newEmail.');
    }
    const regex = /https?:\/\//i;
    const trimmedSlackUrl = slackUrl.replace(regex, '');
    if (!slackUrlRegex.test(trimmedSlackUrl)) {
      messages.push('Invalid slackUrl. e.g: ACME.slack.com');
    }
    return trimmedSlackUrl;
  }

  static validateUserBody(req, res, next) {
    const { slackUrl } = req.body;
    if (slackUrl) {
      const slackUrlRegex = /.+\.slack\.com$/;

      if (slackUrlRegex.test(slackUrl.trim())) {
        return next();
      }
    }

    return res.status(400).json({
      success: false,
      message: 'Compulsory property; slackUrl e.g: ACME.slack.com'
    });
  }
}

export default UserValidator;
