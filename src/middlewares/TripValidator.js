import GeneralValidator from './GeneralValidator';
import UserInputValidator from '../helpers/slack/UserInputValidator';
import HttpError from '../helpers/errorHandler';

class TripValidator {
  static validateAll(req, res, next) {
    const { query: { action } } = req;
    let messages = [];
    if (action === 'confirm') {
      messages = GeneralValidator.validateReqBody(
        req.body,
        'driverName', 'driverPhoneNo',
        'regNumber', 'comment', 'slackUrl'
      );
    }
    if (action === 'decline') {
      messages = GeneralValidator.validateReqBody(
        req.body, 'comment', 'slackUrl'
      );
    }
    const {
      params: { tripId }
    } = req;
    if (!tripId) {
      messages.push('Add tripId to the url');
    }
    if (messages.length) {
      return HttpError.sendErrorResponse({ message: messages }, res);
    }
    next();
  }

  static validateEachInput(req, res, next) {
    const { body } = req;
    const { params: { tripId }, query: { action } } = req;

    const messages = [];
    if (!GeneralValidator.validateNumber(tripId)) {
      messages.push({
        name: 'tripId',
        error: 'Invalid tripId in the url it must be a number. eg: api/v1/trips/12/confirm'
      });
    }
    if (action === 'confirm') {
      messages.push(...UserInputValidator.validateCabDetails({ submission: body }));
    }
    if (!GeneralValidator.validateTeamUrl(body.slackUrl)) {
      messages.push({ name: 'slackUrl', error: 'Invalid slackUrl. e.g: ACME.slack.com' });
    }
    if (messages.length) {
      return HttpError.sendErrorResponse({ message: messages }, res);
    }
    const regex = /https?:\/\//i;
    const trimmedSlackUrl = body.slackUrl.replace(regex, '');
    req.body.slackUrl = trimmedSlackUrl.trim();
    next();
  }
}

export default TripValidator;
