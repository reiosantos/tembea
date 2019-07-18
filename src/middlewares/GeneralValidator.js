import Response from '../helpers/responseHelper';
import HttpError from '../helpers/errorHandler';
import BugsnagHelper from '../helpers/bugsnagHelper';
import { messages } from '../helpers/constants';
import TeamDetailsService from '../services/TeamDetailsService';

const { MISSING_TEAM_URL, INVALID_TEAM_URL } = messages;

class GeneralValidator {
  /**
   * @description This method checks the object passed for the passed properties
   * @param {object} body The body of the request object
   * @param {Array<string>} props The name of the property
   * @returns {array} An array of messages of the missing properties
   */
  static validateReqBody(body, ...props) {
    const errorMessages = [];

    props.forEach((prop) => {
      if (!body[prop]) {
        errorMessages.push(`Please provide ${prop}.`);
      }
    });

    return errorMessages;
  }

  /**
   * @description This method checks if the objects passed in the request body are empty
   * @param {object} body The body of the request object
   * @param {Array<string>} props The name of the property
   * @returns {array} An array of messages of the empty properties
   */
  static validateEmptyReqBodyProp(body, ...props) {
    return props
      .filter(prop => body[prop] !== undefined && !body[prop].toString().trim().length)
      .map(prop => `Please provide a value for ${prop}.`);
  }

  static validateNumber(num) {
    const numRegex = /^[1-9][0-9]*$/;
    return numRegex.test(num);
  }

  static validateIsAlphaNumeric(prop) {
    const alphaRegex = /^([a-zA-Z0-9 _-]+)$/;
    return alphaRegex.test(prop);
  }

  static validateSearchParams(req, res, next) {
    const { name } = req.query;
    const isSpecial = GeneralValidator.validateIsAlphaNumeric(name);
    if (name && !isSpecial) {
      return res.status(400).json({
        success: false,
        message: 'Search cannot have special characters. Try again.'
      });
    }
    return next();
  }

  static disallowNumericsAsValuesOnly(value) {
    const result = GeneralValidator.validateNumber(value);
    if (result) {
      return false;
    }
    return true;
  }

  static validatePhoneNo(num) {
    // eslint-disable-next-line no-useless-escape
    const regex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;
    return regex.test(num);
  }

  static validateRouteId(req, res, next) {
    const { params: { id } } = req;
    if (!GeneralValidator.validateNumber(id)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a positive integer value'
      });
    }
    return next();
  }

  static validateQueryParams(req, res, next) {
    const { page, size } = req.query;

    if (
      (page && !GeneralValidator.validateNumber(page))
      || (size && !GeneralValidator.validateNumber(size))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a positive integer value'
      });
    }
    return next();
  }

  /**
   * @static validateProp
   * @description This method checks if the property passed is empty
   * @param {string} prop The value of the property
   * @param {string} propName The name of the property
   * @returns {array<string>} An array of the error message
   * @memberof GeneralValidator
   */
  static validateProp(prop, propName) {
    if (!prop || prop.trim().length < 1) {
      return [`Please Provide a ${propName}`];
    }
    return [];
  }

  static validateObjectKeyValues(body) {
    return Object.entries(body)
      .reduce((errors, data) => {
        const [key, value] = data;
        if (!value || `${value}`.trim().length < 1) {
          errors.push(`${key} cannot be empty`);
        }
        return errors;
      }, []);
  }

  static validateAllProvidedReqBody(req, res, next) {
    const errors = GeneralValidator.validateObjectKeyValues(req.body);
    return errors.length < 1
      ? next()
      : Response.sendResponse(res, 400, false, errors);
  }

  static validateTeamUrl(teamUrl) {
    const teamUrlRegex = /^(https?:\/\/)?(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*(slack\.com)$/;
    return teamUrlRegex.test(teamUrl);
  }

  static validateTeamUrlInRequestBody(req, res, next) {
    const { body: { teamUrl } } = req;
    if (teamUrl && GeneralValidator.validateTeamUrl(teamUrl.trim())) {
      return next();
    }
    const message = 'Please pass the teamUrl in the request body, e.g: "teamUrl: dvs.slack.com"';
    return Response.sendResponse(res, 400, false, message);
  }

  static isTripStatus(status) {
    return ['Confirmed', 'Pending'].includes(status);
  }

  static isEmpty(value) {
    return (
      typeof value === 'undefined' || value.trim === '' || value.length === 0
    );
  }

  static validateTripFilterParameters(req, res, next) {
    const { status } = req.query;
    const message = 'Status of trips are either Confirmed or Pending';

    if (
      !GeneralValidator.isEmpty(status)
      && !GeneralValidator.isTripStatus(status)
    ) {
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  static validateFellowId(req, res, next) {
    const { query: { id } } = req;
    if (!GeneralValidator.validateNumber(id)) {
      const message = 'Please provide a positive integer value';
      return Response.sendResponse(res, 400, false, message);
    }
    return next();
  }

  /**
   * @description validate  update body middleware
   * @returns void or calls next
   * @example GeneralValidator.validateUpdateBody(1,body,res, ['name','email'], 2);
   * @param integerParam
   * @param body request body
   * @param res response
   * @param updateProperties Array of properties to expected in update body
   * @param requiredLength to check if no parameters where passed in
   */
  static validateUpdateBody(integerParam, body, res, updateProperties, requiredLength, next) {
    const validateParams = GeneralValidator.validateNumber(integerParam);
    if (!validateParams) {
      return HttpError.sendErrorResponse({
        message: { invalidParameter: 'Id should be a valid integer' },
        statusCode: 400
      }, res);
    }
    const inputErrors = GeneralValidator.validateReqBody(
      body, ...updateProperties
    );
    if (inputErrors.length === requiredLength) {
      return HttpError.sendErrorResponse({ message: { inputErrors }, statusCode: 400 }, res);
    }
    const checkEmptyInputData = GeneralValidator.validateEmptyReqBodyProp(
      body, ...updateProperties
    );

    if (checkEmptyInputData.length > 0) {
      return HttpError.sendErrorResponse({ message: { checkEmptyInputData }, statusCode: 400 }, res);
    }
    next();
  }

  /**
   * Validates that a valid teamUrl (slack) is passed to request header
   *
   * @static
   * @param {object} req - Express object
   * @param {object} res - Express response object
   * @param {object} next - Express next function
   * @returns {any} The next middleware or the http response
   * @memberof GeneralValidator
   */
  static async validateSlackUrl(req, res, next) {
    try {
      const teamUrl = req.header('teamUrl');
      HttpError.throwErrorIfNull(teamUrl, MISSING_TEAM_URL, 400);

      const teamDetails = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
      HttpError.throwErrorIfNull(teamDetails, INVALID_TEAM_URL, 400);

      res.locals = { botToken: teamDetails.botToken };
      return next();
    } catch (error) {
      BugsnagHelper.log(error);
      return HttpError.sendErrorResponse(error, res);
    }
  }
}

export default GeneralValidator;
