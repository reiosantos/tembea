import { WebClient } from '@slack/client';
import moment from 'moment';
import { SlackDialogError } from '../../../modules/slack/SlackModels/SlackDialogModels';
import DateDialogHelper from '../../dateHelper';
import TeamDetailsService from '../../../services/TeamDetailsService';
import InputValidator from './InputValidator';

class UserInputValidator {
  static checkNumberAndLetters(param, fieldName) {
    const regex = /[^a-zA-Z\d]+/g;
    if (regex.test(param)) {
      return [new SlackDialogError(fieldName, 'Only numbers and letters are allowed.')];
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
    if (param.trim().length < 1) {
      return [new SlackDialogError(fieldName, `${fieldName} cannot be empty`)];
    }
    return [];
  }

  static checkNumber(number, name) {
    const notIntegerRegex = /^\+?[0-9]+$/;
    if (!notIntegerRegex.test(number.trim())) {
      return [new SlackDialogError(name, 'Only numbers are allowed. ')];
    }
    return [];
  }

  static checkWord(word, name) {
    const wordsNumbersOnly = /^[A-Za-z0-9- ,]+$/;
    if (!wordsNumbersOnly.test(word)) {
      return [new SlackDialogError(name, 'Only alphabets, dashes and spaces are allowed.')];
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
    if (this.checkDateTimeFormat(date)) {
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

  static checkLocations(field, optionalField, fieldName, optionalFieldName) {
    const errors = [];
    const locationDescription = fieldName === 'pickup'
      ? 'Pickup location' : 'Destination';

    if (field !== 'Others' && optionalField) {
      errors.push(
        new SlackDialogError(fieldName,
          `You must select 'Others' before entering a new ${locationDescription}.`),
        new SlackDialogError(optionalFieldName,
          `Enter new location here after selecting 'Others' in the ${locationDescription} field.`)
      );
    }
    if (field === 'Others' && !optionalField) {
      errors.push(
        new SlackDialogError(optionalFieldName,
          `You selected 'Others' in the ${locationDescription} field, please enter a new location.`)
      );
    }
    return errors;
  }

  static checkLocationsWithoutOthersField(pickupLocation, destination) {
    const message = 'Pickup and Destination cannot be the same.';
    if (pickupLocation.toLowerCase() === destination.toLowerCase()) {
      return [new SlackDialogError('pickup', message),
        new SlackDialogError('destination', message)];
    }
    return [];
  }

  static async fetchUserInformationFromSlack(userId, slackBotOauthToken) {
    const web = new WebClient(slackBotOauthToken);

    const { user } = await web.users.info({
      token: slackBotOauthToken,
      user: userId
    });
    return user;
  }

  static validateTravelContactDetails(payload) {
    const {
      submission: { noOfPassengers, riderPhoneNo, travelTeamPhoneNo }
    } = payload;
    const errors = [];
    errors.push(...this.checkNumber(noOfPassengers, 'noOfPassengers'));
    errors.push(...InputValidator.checkNumberGreaterThanZero(
      noOfPassengers, 'noOfPassengers', 'number of passengers'
    ));
    errors.push(...this.checkNumber(riderPhoneNo, 'riderPhoneNo'));
    errors.push(...this.checkNumber(travelTeamPhoneNo, 'travelTeamPhoneNo'));

    errors.push(...this.validateEmptyAndSpaces(noOfPassengers, 'noOfPassengers'));
    errors.push(...this.validateEmptyAndSpaces(riderPhoneNo, 'riderPhoneNo'));
    errors.push(...this.validateEmptyAndSpaces(travelTeamPhoneNo, 'travelTeamPhoneNo'));

    errors.push(...this.checkMinLengthNumber(6, riderPhoneNo, 'riderPhoneNo'));
    errors.push(...this.checkMinLengthNumber(6, travelTeamPhoneNo, 'travelTeamPhoneNo'));

    return errors;
  }

  static validateTravelFormSubmission(formSubmission) {
    const { pickup, destination } = formSubmission;
    const errors = [];

    errors.push(...this.checkLocationsWithoutOthersField(pickup, destination));

    if (formSubmission.flightNumber) {
      errors.push(...this.checkNumberAndLetters(formSubmission.flightNumber, 'flightNumber'));
    }

    return errors;
  }

  static validateLocationEntries(payload) {
    const {
      pickup, othersPickup, destination, othersDestination //eslint-disable-line
    } = payload.submission;
    const errors = [];

    errors.push(...this.checkWord(pickup, 'pickup'));
    errors.push(...this.checkWord(destination, 'destination'));
    errors.push(...this.checkOriginAnDestination(
      pickup,
      destination,
      'pickup',
      'destination'
    ));

    errors.push(...this.checkLocations(pickup, othersPickup, 'pickup', 'othersPickup'));
    errors.push(...this.checkLocations(destination, othersDestination,
      'destination', 'othersDestination'));

    return errors;
  }

  static async validateDateAndTimeEntry(payload, fieldName = 'dateTime') {
    const { submission, team: { id: teamId } } = payload;
    const date = submission.dateTime
      || submission.flightDateTime || submission.embassyVisitDateTime;
    const sanitizedDate = date.trim().replace(/\s\s+/g, ' ');
    const errors = [];

    try {
      const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
      const user = await this.fetchUserInformationFromSlack(payload.user.id, slackBotOauthToken);

      errors.push(...this.checkDate(sanitizedDate, user.tz_offset, fieldName));
      errors.push(...this.checkDateTimeFormat(
        DateDialogHelper.changeDateTimeFormat(sanitizedDate),
        fieldName
      ));

      return errors;
    } catch (error) {
      throw new Error('There was a problem processing your request');
    }
  }

  static checkUsername(user, name) {
    const username = /[a-zA-Z]$/;
    if (!user || !username.test(user)) {
      return [new SlackDialogError(name, 'Invalid username.')];
    }
    return [];
  }

  static checkPhoneNumber(phoneNumber, name) {
    const num = /^\+?[0-9]{6,16}$/;

    if (!num.test(phoneNumber)) {
      return [new SlackDialogError(name, 'Invalid phone number!')];
    }
    return [];
  }

  static checkNumberPlate(numberPlate, name) {
    const plate = /[A-Z0-9\s]$/;
    let testStr = '';
    if (numberPlate) testStr = numberPlate.toUpperCase();
    if (!plate.test(testStr)) {
      return [new SlackDialogError(name, 'Invalid cab registration number!')];
    }
    return [];
  }

  static validateCabDetails(payload) {
    const { driverName, driverPhoneNo, regNumber } = payload.submission;
    const errors = [];
    errors.push(...this.checkUsername(driverName, 'driverName'));
    errors.push(...this.checkPhoneNumber(driverPhoneNo, 'driverPhoneNo'));
    errors.push(...this.checkNumberPlate(regNumber, 'regNumber'));
    return errors;
  }

  static validateCoordinates(payload) {
    const { coordinates } = payload.submission;
    const errors = [];
    errors.push(...InputValidator.checkValidCoordinates(coordinates, 'coordinates'));
    return errors;
  }
}

export default UserInputValidator;
