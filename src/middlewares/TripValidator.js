import moment from 'moment';
import GeneralValidator from './GeneralValidator';
import HttpError from '../helpers/errorHandler';
import { TripService } from '../services/TripService';
import { getTripsSchema, tripUpdateSchema, travelTripSchema } from './ValidationSchemas';
import JoiHelper from '../helpers/JoiHelper';
import Response from '../helpers/responseHelper';
import TripHelper from '../helpers/TripHelper';


class TripValidator {
  static async validateAll(req, res, next) {
    const { query: { action }, params: { tripId } } = req;

    const validateParams = JoiHelper
      .validateSubmission({ ...req.body, tripId, action }, tripUpdateSchema);
    if (validateParams.errorMessage) {
      return HttpError.sendErrorResponse({ statusCode: 400, message: validateParams }, res);
    }
    const regex = /https?:\/\//i;
    req.body = validateParams;
    delete req.body.action;
    delete req.body.tripId;
    req.body.slackUrl = req.body.slackUrl.replace(regex, '').trim();

    const isTrip = await TripService.checkExistence(tripId);
    if (!isTrip) {
      return HttpError.sendErrorResponse({ statusCode: 404, message: 'Trip Does not exist' }, res);
    }
    next();
  }

  static validateGetTripsParam(req, res, next) {
    const errors = [];
    const { query: { status, page, size } } = req;

    const validateParams = JoiHelper.validateSubmission({ status, page, size }, getTripsSchema);
    if (validateParams.errorMessage) {
      return Response.sendResponse(res, 400, false, 'Validation Error', { errors: validateParams });
    }
    const departureTime = TripHelper.cleanDateQueryParam(req.query, 'departureTime');
    const requestedOn = TripHelper.cleanDateQueryParam(req.query, 'requestedOn');

    const param = { departureTime, requestedOn };

    errors.push(...TripValidator.validateDateParam(param, 'departureTime'));

    errors.push(...TripValidator.validateDateParam(param, 'requestedOn'));

    TripValidator.extracted(departureTime, errors, 'departureTime');
    TripValidator.extracted(requestedOn, errors, 'requestedOn');

    if (errors.length) {
      return Response.sendResponse(res, 400, false, 'Validation Error', { errors });
    }

    return next();
  }

  static extracted(requestedOn, errors, field) {
    if (requestedOn) {
      const { after, before } = requestedOn;
      errors.push(...TripValidator.validateTime(after, before, field));
    }
  }

  static validateTime(after, before, field) {
    let message;
    const errors = [];
    message = TripValidator.validateTimeFormat(after, `${field} 'after'`);
    if (message) {
      errors.push(message);
    }
    message = TripValidator.validateTimeFormat(before, `${field} 'before'`);
    if (message) {
      errors.push(message);
    }

    if (!TripValidator.validateTimeOrder(after, before)) {
      errors.push(`${field} 'before' date cannot be less than 'after' date`);
    }
    return errors;
  }

  static validateTimeFormat(time, field) {
    const formattedTime = moment(time || '', 'YYYY-MM-DD');
    if (time && !formattedTime.isValid()) {
      return (`${field} date is not valid. It should be in the format 'YYYY-MM-DD'`);
    }
  }

  static validateTimeOrder(dateFrom, dateTo) {
    const from = moment(dateFrom, 'YYYY-MM-DD');
    const to = moment(dateTo, 'YYYY-MM-DD');
    const isAfter = to.isAfter(from);
    const isValid = from.isValid() && to.isValid();
    if (!dateFrom || !dateTo) {
      return true;
    }
    return isValid && isAfter;
  }

  static validateDateParam(data, field) {
    const dateFormat = `must be in the format ${field}=before:YYYY-MM-DD;after:YYYY-MM-DD`;
    const invalidKeys = Object.keys(data[field] || {})
      .filter(key => key !== 'after' && key !== 'before');
    if (invalidKeys.length) {
      return [(`Invalid format, ${field} ${dateFormat}`)];
    }
    return [];
  }

  static validateTravelTrip(req, res, next) {
    return GeneralValidator.joiValidation(req, res, next, req.body, travelTripSchema);
  }
}

export default TripValidator;
