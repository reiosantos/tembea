import { WebClient } from '@slack/client';
import { SlackDialogError } from '../../../modules/slack/SlackModels/SlackDialogModels';
import DateDialogHelper from '../../dateHelper';
import TeamDetailsService from '../../../services/TeamDetailsService';
import InputValidator from './InputValidator';
import Validators from './Validators';

class UserInputValidator {
  static async fetchUserInformationFromSlack(userId, slackBotOauthToken) {
    const web = new WebClient(slackBotOauthToken);

    const { user } = await web.users.info({
      token: slackBotOauthToken,
      user: userId
    });
    return user;
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

  static validateTravelContactDetails(payload) {
    const {
      submission: { noOfPassengers, riderPhoneNo, travelTeamPhoneNo }
    } = payload;
    const errors = [];
    errors.push(...Validators.validateRegex('checkNumber', noOfPassengers.trim(), 'noOfPassengers'));
    errors.push(...InputValidator.checkNumberGreaterThanZero(
      noOfPassengers, 'noOfPassengers', 'number of passengers'
    ));
    errors.push(...Validators.validateRegex('checkNumber', riderPhoneNo.trim(), 'riderPhoneNo'));
    errors.push(...Validators.validateRegex('checkNumber', travelTeamPhoneNo.trim(), 'travelTeamPhoneNo'));

    errors.push(...Validators.validateEmptyAndSpaces(noOfPassengers, 'noOfPassengers'));
    errors.push(...Validators.validateEmptyAndSpaces(riderPhoneNo, 'riderPhoneNo'));
    errors.push(...Validators.validateEmptyAndSpaces(travelTeamPhoneNo, 'travelTeamPhoneNo'));

    errors.push(...Validators.checkMinLengthNumber(6, riderPhoneNo, 'riderPhoneNo'));
    errors.push(...Validators.checkMinLengthNumber(6, travelTeamPhoneNo, 'travelTeamPhoneNo'));

    return errors;
  }

  static validateTravelFormSubmission(formSubmission) {
    const { pickup, destination } = formSubmission;
    const errors = [];

    errors.push(...Validators.checkLocationsWithoutOthersField(pickup, destination));

    if (formSubmission.flightNumber) {
      errors.push(...Validators.validateRegex('checkNumbersAndLetters',
        formSubmission.flightNumber, 'flightNumber'));
    }

    return errors;
  }

  static validateLocationEntries(payload) {
    const {
      pickup, othersPickup, destination, othersDestination //eslint-disable-line
    } = payload.submission;
    const errors = [];

    errors.push(...Validators.validateRegex('checkWord', pickup, 'pickup'));
    errors.push(...Validators.validateRegex('checkWord', destination, 'destination'));
    errors.push(...Validators.checkOriginAnDestination(
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

      errors.push(...Validators.checkDate(sanitizedDate, user.tz_offset, fieldName));
      errors.push(...Validators.checkDateTimeFormat(
        DateDialogHelper.changeDateTimeFormat(sanitizedDate),
        fieldName
      ));

      return errors;
    } catch (error) {
      throw new Error('There was a problem processing your request');
    }
  }

  static validateCabDetails(payload) {
    const { driverName, driverPhoneNo, regNumber } = payload.submission;
    const errors = [];
    errors.push(...Validators.validateRegex('checkUsername', driverName, 'driverName'));
    errors.push(...Validators.validateRegex('checkPhoneNumber', driverPhoneNo, 'driverPhoneNo'));
    errors.push(...Validators.validateRegex('checkNumberPlate', regNumber, 'regNumber'));
    return errors;
  }

  static validateCoordinates(payload) {
    const { coordinates } = payload.submission;
    const errors = [];
    errors.push(...InputValidator.checkValidCoordinates(coordinates, 'coordinates'));
    return errors;
  }

  static validateApproveRoutesDetails(payload) {
    const {
      routeName, routeCapacity, takeOffTime, regNumber
    } = payload.submission;
    const errors = [];
    errors.push(...Validators.validateRegex('checkWord', routeName, 'routeName'));
    errors.push(...Validators.validateRegex('checkNumber', routeCapacity.trim(), 'routeCapacity'));
    errors.push(...Validators.checkTimeFormat(takeOffTime, 'takeOffTime'));
    errors.push(...Validators.validateRegex('checkNumberPlate', regNumber, 'regNumber'));
    return errors;
  }

  static validateEngagementForm(engagementFormData) {
    const { nameOfPartner, workingHours } = engagementFormData;
    if (!Validators.isDateFormatValid(workingHours)) {
      return {
        errors: [
          new SlackDialogError('workingHours', 'Invalid date')
        ]
      };
    }
    if (!nameOfPartner.trim()) {
      return {
        errors: [
          new SlackDialogError('nameOfPartner', 'Please enter your partner\'s name')
        ]
      };
    }
  }
}

export default UserInputValidator;
