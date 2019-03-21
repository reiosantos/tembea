import moment from 'moment';
import { SlackDialogError } from '../../../modules/slack/SlackModels/SlackDialogModels';
import UserInputValidator from './index';
import Validators from './Validators';

export default class ManagerFormValidator {
  static validateReasons(reason, field) {
    const regex = /(\w)+/g;
    if (!reason || !regex.test(reason.trim())) {
      return [new SlackDialogError(field, 'Invalid input')];
    }
    return [];
  }

  static validateDate(date, fieldName) {
    const sanitizedDate = date.trim().replace(/\s\s+/g, ' ');
    const sdDate = moment(sanitizedDate, 'MM-DD-YYYY');
    const errors = [];
    if (!sdDate.isValid()) {
      errors.push(new SlackDialogError(
        fieldName, 'Date provided is not valid. It must be in Day/Month/Year format. See hint.'
      ));
    }
    return errors;
  }

  static compareDate(startDate, endDate) {
    const sdDate = moment(startDate, 'MM-DD-YYYY');
    const edDate = moment(endDate, 'MM-DD-YYYY');
    const isAfter = edDate.isAfter(sdDate);
    const errors = [];
    const isValid = sdDate.isValid() && edDate.isValid();
    if (isValid && !isAfter) {
      errors.push(new SlackDialogError(
        'endDate', 'End date cannot less than start date'
      ));
    }
    return errors;
  }

  static validateEngagementDate(startDate, endDate) {
    return ManagerFormValidator.validateDate(startDate, 'startDate')
      .concat(ManagerFormValidator.validateDate(endDate, 'endDate'))
      .concat(ManagerFormValidator.compareDate(startDate, endDate));
  }

  static validateStatus(routeRequest, statusText) {
    const { status } = routeRequest;
    return status.toLowerCase() === statusText;
  }

  static approveRequestFormValidation(payload) {
    const errors = [];
    const checkIfEmpty = Validators.validateDialogSubmission(payload);
    errors.push(...checkIfEmpty);

    if (payload.submission.routeName) {
      const err = UserInputValidator.validateApproveRoutesDetails(payload);
      errors.push(...err);
    }
    return errors;
  }
}
