import { WebClient } from '@slack/client';
import { SlackDialogError } from '../../../modules/slack/SlackModels/SlackDialogModels';
import DateDialogHelper from '../../dateHelper';
import TeamDetailsService from '../../../services/TeamDetailsService';
import InputValidator from './InputValidator';
import Validators from './Validators';
import { getPageNumber } from '../../../modules/slack/TripManagement/TripItineraryController';
import CleanData from '../../cleanData';

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

  static validateTravelContactDetails(data) {
    const payload = CleanData.trim(data);
    const {
      submission: { noOfPassengers, riderPhoneNo, travelTeamPhoneNo }
    } = payload;
    const errors = [];
    errors.push(...Validators.validateRegex('checkNumber', noOfPassengers, 'noOfPassengers'));
    errors.push(...InputValidator.checkNumberGreaterThanZero(
      noOfPassengers, 'noOfPassengers', 'number of passengers'
    ));
    errors.push(...Validators.validateRegex('checkNumber', riderPhoneNo, 'riderPhoneNo'));
    errors.push(...Validators.validateRegex('checkNumber', travelTeamPhoneNo, 'travelTeamPhoneNo'));

    errors.push(...Validators.checkMinLengthNumber(6, riderPhoneNo, 'riderPhoneNo'));
    errors.push(...Validators.checkMinLengthNumber(6, travelTeamPhoneNo, 'travelTeamPhoneNo'));

    errors.push(...Validators.validateEmptyAndSpaces(noOfPassengers, 'noOfPassengers'));
    errors.push(...Validators.validateEmptyAndSpaces(riderPhoneNo, 'riderPhoneNo'));
    errors.push(...Validators.validateEmptyAndSpaces(travelTeamPhoneNo, 'travelTeamPhoneNo'));


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

  static async validatePickupDestinationEntry(payload, type, dateFieldName,
    travelDateTime, allowedHours) {
    const errors = [];
    if (type === 'pickup') {
      const {
        pickup, othersPickup, flightNumber
      } = payload.submission;
      errors.push(...Validators.validateRegex('checkWord', pickup, 'pickup'));
      errors.push(...this.checkLocations(pickup, othersPickup, 'pickup', 'othersPickup'));
      errors.push(...Validators.checkDateTimeIsHoursAfterNow(allowedHours,
        travelDateTime, dateFieldName));
      errors.push(...Validators.validateRegex('checkNumbersAndLetters',
        flightNumber, 'flightNumber'));
      try {
        errors.push(...await UserInputValidator.validateDateAndTimeEntry(payload, dateFieldName));
      } catch (error) {
        // error caught
      }
    } else {
      const {
        destination, othersDestination
      } = payload.submission;
      errors.push(...Validators.validateRegex('checkWord', destination, 'destination'));
      errors.push(...this.checkLocations(destination, othersDestination,
        'destination', 'othersDestination'));
    }
    return errors;
  }
  
  static validatePickupDestinationLocationEntries(payload, typeOfDialogBox) {
    if (typeOfDialogBox === 'pickup') {
      const { submission: { pickup, othersPickup } } = payload;
      return UserInputValidator.validateDialogBoxLocation(pickup,
        othersPickup, typeOfDialogBox);
    }
    const { submission: { destination, othersDestination, pickup } } = payload;
    const errors = [];
    errors.push(...Validators.checkOriginAnDestination(
      pickup, destination,
      'pickup', 'destination'
    ));
    errors.push(...UserInputValidator.validateDialogBoxLocation(destination,
      othersDestination, typeOfDialogBox));
    return errors;
  }

  static validateDialogBoxLocation(firstLocation, secondLocation, typeOfDialogBox) {
    const errors = [];
    errors.push(...Validators.validateRegex('checkWord', firstLocation, typeOfDialogBox));
    errors.push(...UserInputValidator.checkLocations(firstLocation, secondLocation,
      typeOfDialogBox, `others${typeOfDialogBox}`));
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

  static validateApproveRoutesDetails(data) {
    const payload = CleanData.trim(data);
    const {
      routeName, routeCapacity, takeOffTime, regNumber
    } = payload.submission;
    const errors = [];
    errors.push(...Validators.validateRegex('checkWord', routeName, 'routeName'));
    errors.push(...Validators.validateRegex('checkNumber', routeCapacity, 'routeCapacity'));
    errors.push(...Validators.checkTimeFormat(takeOffTime, 'takeOffTime'));
    errors.push(...Validators.validateRegex('checkNumberPlate', regNumber, 'regNumber'));
    return errors;
  }

  static validateSkipToPage(payload) {
    const page = Number(getPageNumber(payload) || -1);
    if (Number.isNaN(page) || page === -1) {
      return {
        errors: [
          new SlackDialogError('pageNumber', 'Not a number')
        ]
      };
    }
  }

  static validateEngagementForm(engagementFormData) {
    const { nameOfPartner, workingHours } = CleanData.trim(engagementFormData);
    if (!Validators.isDateFormatValid(workingHours)) {
      return {
        errors: [
          new SlackDialogError('workingHours', 'Invalid date')
        ]
      };
    }
    if (!nameOfPartner) {
      return {
        errors: [
          new SlackDialogError('nameOfPartner', 'Please enter your partner\'s name')
        ]
      };
    }
  }

  static validateSearchRoute(search) {
    if (!search.trim()) {
      return {
        errors: [
          new SlackDialogError('search', 'search cannot be empty')
        ]
      };
    }
  }

  static validateStartRouteSubmission(payload) {
    let errors;
    const { submission } = payload;
    if (submission && submission.pageNumber) {
      errors = UserInputValidator.validateSkipToPage(payload);
    }
    if (submission && submission.search) {
      errors = UserInputValidator.validateSearchRoute(submission.search);
    }
    return errors;
  }

  static getScheduleTripDetails(tripData) {
    const userTripData = {
      ...tripData
    };
    const {
      destination, pickup, othersDestination, othersPickup
    } = userTripData;
    userTripData.destination = destination === 'Others' ? othersDestination : destination;
    userTripData.pickup = pickup === 'Others' ? othersPickup : pickup;
    Object.keys(userTripData).map((key) => {
      if (key === 'pickUpAddress' || key === 'destinationAddress') {
        const type = key === 'pickUpAddress' ? 'pickup' : 'destination';
        userTripData[type] = userTripData[key].address;
        userTripData[`${type}Lat`] = userTripData[key].latitude;
        userTripData[`${type}Long`] = userTripData[key].longitude;
        delete userTripData[key];
      }
      return true;
    });
    delete userTripData.tripDetails;
    return userTripData;
  }
}

export default UserInputValidator;
