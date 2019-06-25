import Response from '../helpers/responseHelper';
import HttpError from '../helpers/errorHandler';
import BugsnagHelper from '../helpers/bugsnagHelper';
import { messages } from '../helpers/constants';
import TeamDetailsService from '../services/TeamDetailsService';
import JoiHelper from '../helpers/JoiHelper';
import { querySchema } from './ValidationSchemas';

const { MISSING_TEAM_URL, INVALID_TEAM_URL } = messages;

class GeneralValidator {
  static validateQueryParams(req, res, next) {
    const validQuery = JoiHelper.validateSubmission(req.query, querySchema);

    if (validQuery.errorMessage) {
      return Response.sendResponse(res, 400, false, validQuery);
    }
    req.query = validQuery;
    next();
  }

  static validateNumber(num) {
    const numRegex = /^[1-9][0-9]*$/;
    return numRegex.test(num);
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

  /**
   * @description performs validation using joi library
   * @returns error response or calls next
   * @param req request object
   * @param next the next function
   * @param res response
   * @param data object containing properties to be used
   * @param schema the validation schema to be used
   * @param id set to true if the data contains an id from the request params
   * @param query set to true if the data contains query from the request params
   */
  static joiValidation(req, res, next, data, schema, id = false, query = false) {
    const validate = JoiHelper.validateSubmission(data, schema);
    if (validate.errorMessage) {
      const { errorMessage, ...rest } = validate;
      // return Response.sendResponse(res, 400, false, errorMessage, { ...rest });
      return HttpError.sendErrorResponse({
        statusCode: 400,
        message: errorMessage,
        error: { ...rest }
      }, res);
    }
    if (id) {
      delete validate.id;
      req.body = validate;
      return next();
    }
    if (query) {
      req.query = validate;
      return next();
    }
    req.body = validate;
    return next();
  }
}

export default GeneralValidator;
