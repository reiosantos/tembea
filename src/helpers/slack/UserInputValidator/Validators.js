import moment from 'moment';
import * as Joi from '@hapi/joi';
import { SlackDialogError } from '../../../modules/slack/SlackModels/SlackDialogModels';
import InputValidator from './InputValidator';
import DateDialogHelper from '../../dateHelper';

const regexObject = {
  checkNumbersAndLetters: {
    regex: /^[a-zA-Z\d]+$/g,
    error: 'Only numbers and letters are allowed.'
  },
  checkNumber: {
    regex: /^\+?[0-9]+$/,
    error: 'Only numbers are allowed. '
  },
  checkWord: {
    regex: /^[A-Za-z0-9- ,]+$/,
    error: 'Only alphabets, dashes and spaces are allowed.'
  },
  checkUsername: {
    regex: /[a-zA-Z]$/,
    error: 'Invalid username.'
  },
  checkPhoneNumber: {
    regex: /^\+?[0-9]{6,16}$/,
    error: 'Invalid phone number!'
  },
  checkNumberPlate: {
    regex: /[A-Z0-9\s]$/,
    error: 'Invalid cab registration number!'
  }
};
class Validators {
  static validateRegex(type, param, fieldName) {
    const { [type]: { regex, error } } = regexObject;

    let testString = param;

    if (type === 'checkNumberPlate') {
      testString = param ? param.toUpperCase() : '';
    }

    if (!testString || !regex.test(testString)) {
      return [new SlackDialogError(fieldName, error)];
    }
    return [];
  }

  static checkMinLengthNumber(minLength, number, name) {
    const numLength = number.trim().length;
    if (numLength < minLength) {
      return [new SlackDialogError(name, `Minimum length is ${minLength} digits`)];
    }
    return [];
  }

  static checkDateTimeIsHoursAfterNow(noOfHours, date, fieldName) {
    const userDateInput = moment(date, 'DD/MM/YYYY HH:mm');
    const afterTime = moment().add(noOfHours, 'hours');
    if (userDateInput.isAfter(afterTime)) {
      return [];
    }
    return [new SlackDialogError(
      fieldName, `${fieldName} must be at least ${noOfHours} hours from current time.`
    )];
  }

  static validateEmptyAndSpaces(param, name) {
    if (InputValidator.isEmptySpace(param)) {
      return [new SlackDialogError(name, 'Spaces are not allowed')];
    }
    return [];
  }

  static checkEmpty(param, fieldName) {
    if (typeof param === 'string' && param.trim().length < 1) {
      return [new SlackDialogError(fieldName, 'This field cannot be empty')];
    }
    return [];
  }

  static checkOriginAnDestination(pickup, destination, pickupName, destinationName) {
    if (pickup.toLowerCase() === destination.toLowerCase() && pickup !== 'Others') {
      return [
        new SlackDialogError(pickupName, 'Pickup location and Destination cannot be the same.'),
        new SlackDialogError(destinationName, 'Pickup location and Destination cannot be the same.')
      ];
    }
    return [];
  }

  static checkDate(date, tzOffset, fieldName = 'date_time') {
    if (Validators.checkDateTimeFormat(date)) {
      const diff = DateDialogHelper.dateChecker(date, tzOffset);
      if (diff < 0) {
        return [new SlackDialogError(fieldName, 'Date cannot be in the past.')];
      }
    }
    return [];
  }

  static checkDateFormat(date, fieldName) {
    if (!DateDialogHelper.validateDate(date)) {
      return [new SlackDialogError(fieldName,
        'Time format must be in Day/Month/Year format. See hint.')];
    }
    return [];
  }

  static checkDateTimeFormat(date, fieldName = 'date_time') {
    if (!DateDialogHelper.validateDateTime(date)) {
      return [new SlackDialogError(fieldName,
        'Time format must be in Day/Month/Year format. See hint.')];
    }
    return [];
  }

  static checkLocationsWithoutOthersField(pickupLocation, destination) {
    const message = 'Pickup and Destination cannot be the same.';
    if (pickupLocation.toLowerCase() === destination.toLowerCase()) {
      return [new SlackDialogError('pickup', message),
        new SlackDialogError('destination', message)];
    }
    return [];
  }

  static isDateFormatValid(date) {
    // date format should be (hh:mm - hh:mm)
    const validDate = date.includes('-') ? date.split('-') : '';

    if (validDate.length) {
      const [from, to] = validDate;
      const momentFromTime = moment(from, 'HH:mm');
      const momentToTime = moment(to, 'HH:mm');
      return momentFromTime.isValid() && momentToTime.isValid();
    }
  }

  static checkTimeFormat(time, field) {
    const errors = [];
    if (!DateDialogHelper.validateTime(time)) {
      errors.push(new SlackDialogError(field, 'Invalid time'));
    }
    return errors;
  }

  static validateDialogSubmission(payload) {
    const {
      submission
    } = payload;
    const inputs = Object.keys(submission).map((key) => {
      const invalidInputs = Validators.checkEmpty(submission[key], key);
      if (invalidInputs.length) {
        const [error] = invalidInputs;
        return error;
      }
      return false;
    }).filter((items) => items !== false);
    return inputs;
  }

  static validateSubmission(submission, schema) {
    const result = Joi.validate(submission, schema, {
      abortEarly: false,
      convert: true,
    });
    if (result.error) {
      const error = new Error('validation failed');
      error.errors = result.error;
      throw error;
    }
    return result.value;
  }

  static checkDuplicatePhoneNo(riderPhoneNo, travelTeamPhoneNo) {
    const message = 'Passenger and travel team phone number cannot be the same.';
    if (riderPhoneNo === travelTeamPhoneNo) {
      return [new SlackDialogError('riderPhoneNo', message),
        new SlackDialogError('travelTeamPhoneNo', message)];
    }
    return [];
  }
}

export default Validators;
