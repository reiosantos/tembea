import moment from 'moment';
import UserInputValidator from '../index';
import Validators from '../Validators';
import DateDialogHelper from '../../../dateHelper';
import {
  createPayload
} from '../../../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import ManagerFormValidator from '../managerFormValidator';

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    chat: { postMessage: jest.fn(() => Promise.resolve(() => {})) },
    users: {
      info: jest.fn(() => Promise.resolve({
        user: { real_name: 'someName', profile: {} },
        token: 'sdf'
      })),
      profile: {
        get: jest.fn(() => Promise.resolve({
          profile: {
            tz_offset: 'someValue',
            email: 'sekito.ronald@andela.com'
          }
        }))
      }
    }
  }))
}));


describe('checkNumbersAndLetters', () => {
  it('should accept numbers and letters', () => {
    const errors = Validators.validateRegex('checkNumbersAndLetters', '0A', 'name');
    expect(errors.length).toEqual(0);
  });
  it('should not accept letters and special characters', () => {
    const errors = Validators.validateRegex('checkNumbersAndLetters', '***testthis***', 'name');
    expect(errors.length).toEqual(1);
  });
});

describe('checkMinLengthNumber', () => {
  it('should accept numbers of a defined length in the parameters', () => {
    const errors = Validators.checkMinLengthNumber('5', '12345', 'number');
    expect(errors.length).toEqual(0);
  });
  it('should not accept numbers less than the defined length in the parameters', () => {
    const errors = Validators.checkMinLengthNumber('5', '1', 'number');
    expect(errors.length).toEqual(1);
  });
});

describe('validateEmptyAndSpaces', () => {
  it('should not allow empty spaces', () => {
    const result = Validators.validateEmptyAndSpaces('           ');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('checkLocationsWithoutOthersField', () => {
  it('should not allow empty spaces', () => {
    let result = Validators.checkLocationsWithoutOthersField('equal', 'equal');
    expect(result.length).toBeGreaterThan(0);

    result = Validators.checkLocationsWithoutOthersField('equal', 'not equal');
    expect(result.length).toEqual(0);
  });
});

describe('validateTravelFormSubmission', () => {
  it('should not allow empty spaces', () => {
    const payload = { pickup: 'equal', destination: '' };

    let result = UserInputValidator.validateTravelFormSubmission(payload);
    expect(result.length).toEqual(0);

    payload.flightNumber = ')(';
    payload.destination = 'equal';
    result = UserInputValidator.validateTravelFormSubmission(payload);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('validateTravelFormSubmission', () => {
  it('should not allow empty spaces', () => {
    const payload = { submission: { noOfPassengers: '', riderPhoneNo: '', travelTeamPhoneNo: '' } };

    const result = UserInputValidator.validateTravelContactDetails(payload);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('checkNumber', () => {
  it('should accept numbers', () => {
    const errors = Validators.validateRegex('checkNumber', '0', 'number');
    expect(errors.length).toEqual(0);
  });
  it('should not accept letters and special characters', () => {
    const errors = Validators.validateRegex('checkNumber', '***test***', 'number');
    expect(errors.length).toEqual(1);
  });
});

describe('UserInputValidator tests', () => {
  describe('checkWord', () => {
    it('should return an error when address contains special characters', () => {
      const errors = Validators.validateRegex('checkWord', '13, Androse road $$$');
      expect(errors.length).toEqual(1);
    });
    it('should return an empty array when address is good', () => {
      const errors = Validators.validateRegex('checkWord', '13, Androse road');
      expect(errors.length).toEqual(0);
    });
  });

  describe('checkOriginAnDestination', () => {
    it('should return errors when pickup and destination are NOT Others but are the same', () => {
      const errors = Validators.checkOriginAnDestination(
        'Andela-Nairobi', 'Andela-Nairobi', 'pickupName', 'destinationName'
      );
      expect(errors.length).toEqual(2);
    });
    it('should return errors when pickup and destination are NOT Others and NOT the same', () => {
      const errors = Validators.checkOriginAnDestination(
        'Andela-Nairobi', 'Andela-Kigali', 'pickupName', 'destinationName'
      );
      expect(errors.length).toEqual(0);
    });
  });

  describe('checkDate', () => {
    it('should return errors when date is less than now', () => {
      DateDialogHelper.dateChecker = jest.fn(() => -20);
      const errors = Validators.checkDate('10/10/2018 22:00', 3600);
      expect(errors.length).toEqual(1);
    });
    it('should return an empty array when date is greater than now', () => {
      DateDialogHelper.dateChecker = jest.fn(() => 20);
      const errors = Validators.checkDate('10/10/2050 22:00', 3600);
      expect(errors.length).toEqual(0);
    });
  });

  describe('checkDateTimeFormat', () => {
    it('should return errors when date is NOT in Day/Month/Year HH:MM format', () => {
      DateDialogHelper.validateDateTime = jest.fn(() => false);
      const errors = Validators.checkDateTimeFormat('10/10/2018 22:00');
      expect(errors.length).toEqual(1);
    });
    it('should return an empty array when date is in Day/Month/Year HH:MM format', () => {
      DateDialogHelper.validateDateTime = jest.fn(() => true);
      const errors = Validators.checkDateTimeFormat('10/10/2050 22:00');
      expect(errors.length).toEqual(0);
    });
  });

  describe('checkDateFormat', () => {
    it('should return errors when date is NOT in Month/Day/Year format', () => {
      const errors = Validators.checkDateFormat('10/33/2018');
      expect(errors.length).toEqual(1);
    });
    it('should return an empty array when date is in Day/Month/Year format', () => {
      const errors = Validators.checkDateFormat('10/10/2050');
      expect(errors.length).toEqual(0);
    });
  });

  describe('checkLocations', () => {
    it(`should return errors when a location is selected
      and the "Others" field is populated`, () => {
      const errors = UserInputValidator.checkLocations(
        'Andela-Nairobi', '13, Androse road', 'pickup', 'others_pickup'
      );
      expect(errors.length).toEqual(2);
    });

    it('should return error if a location is set to Others and the "Others" field is empty', () => {
      const errors = UserInputValidator.checkLocations(
        'Others', '', 'pickup', 'others_pickup'
      );
      expect(errors.length).toEqual(1);
    });

    it('should return an empty array if all is good', () => {
      const errors = UserInputValidator.checkLocations(
        'Others', '13, Androse road', 'pickup', 'others_pickup'
      );
      expect(errors.length).toEqual(0);
    });
  });

  describe('fetchUserInformationFromSlack', () => {
    it('should return user\'s slack profile information', async () => {
      const user = await UserInputValidator.fetchUserInformationFromSlack('dummyId');
      expect(user.real_name).toEqual('someName');
    });
  });

  describe('validateLocationEntries', () => {
    it('should return location validation errors if they exist', () => {
      const payload = createPayload();
      const errors = UserInputValidator.validateLocationEntries(payload);
      expect(errors.length).toEqual(0);
    });
  });

  describe('validateDateAndTimeEntry', () => {
    it('should return date validation errors if they exist', async () => {
      Validators.checkDate = jest.fn(() => []);
      Validators.checkDateTimeFormat = jest.fn(() => []);
      TeamDetailsService.getTeamDetailsBotOauthToken = jest.fn(() => {});
      const payload = createPayload();
      const errors = await UserInputValidator.validateDateAndTimeEntry(payload);
      expect(errors.length).toEqual(0);
    });
    it('should handle and throw errors within validateDateAndTimeEntry', async () => {
      try {
        UserInputValidator.fetchUserInformationFromSlack = jest.fn(() => Promise.reject());
        const payload = createPayload();
        await UserInputValidator.validateDateAndTimeEntry(payload);
        expect(UserInputValidator.fetchUserInformationFromSlack).toBeCalledWith(payload.user.id);
      } catch (e) {
        expect(e.message).toEqual('There was a problem processing your request');
      }
    });
  });

  describe('compareDate', () => {
    it('invalid end date', () => {
      const result = ManagerFormValidator.compareDate('02/02/2019', '03/02/2018');
      expect(result[0].error).toEqual('End date cannot less than start date');
    });
  });

  describe('checkUsername', () => {
    it('valid user name', () => {
      const result = Validators.validateRegex('checkUsername', 'dummyUser', 'driver');
      expect(result.length).toEqual(0);
    });
    it('invalid username', () => {
      let result = Validators.validateRegex('checkUsername', '*****dummyUser*****', 'driver');
      expect(result.length).toEqual(1);
      result = Validators.validateRegex('checkUsername', null, 'driver');
      expect(result.length).toEqual(1);
    });
  });
});

describe('checkPhoneNumber', () => {
  it('valid phone number', () => {
    const result = Validators.validateRegex('checkPhoneNumber', '23481234567', 'driver');
    expect(result.length).toEqual(0);
  });
  it('invalid phone number', () => {
    let result = Validators.validateRegex('checkPhoneNumber', '*****dummyUser*****', 'driver');
    expect(result.length).toEqual(1);
    result = Validators.validateRegex('checkPhoneNumber', '1233', 'driver');
    expect(result.length).toEqual(1);
    result = Validators.validateRegex('checkPhoneNumber', null, 'driver');
    expect(result.length).toEqual(1);
  });
});

describe('checkNumberPlate', () => {
  it('valid plate number', () => {
    let result = Validators.validateRegex('checkNumberPlate', 'LND 419 SMC', 'driver');
    expect(result.length).toEqual(0);
    result = Validators.validateRegex('checkNumberPlate', 'LND 419 smn', 'driver');
    expect(result.length).toEqual(0);
  });
  it('invalid plate number', () => {
    let result = Validators.validateRegex('checkNumberPlate', '*****Invalid Plate******', 'driver');
    expect(result.length).toEqual(1);
    result = Validators.validateRegex('checkNumberPlate', null, 'driver');
    expect(result.length).toEqual(1);
  });
});

describe('checkNumberPlate', () => {
  const payload = {
    submission: {
      driverName: 'Valid User',
      driverPhoneNo: '1234567890',
      regNumber: 'LND 419 smn',
    }
  };
  it('valid', async () => {
    const result = UserInputValidator.validateCabDetails(payload);
    expect(result.length).toEqual(0);
  });
  it('invalid', () => {
    payload.submission.regNumber = '*inalid reg number*';
    const result = UserInputValidator.validateCabDetails(payload);
    expect(result.length).toEqual(1);
  });
});

describe('test Validators class', () => {
  it('should not digit characters', () => {
    const result = Validators.validateRegex('checkNumber', 'aass', 'number');
    expect(result[0]).toHaveProperty('error', 'Only numbers are allowed. ');
  });

  it('should test empty fields', () => {
    const result = Validators.checkEmpty(' ', 'destination');
    expect(result[0]).toHaveProperty('error', 'destination cannot be empty');
  });

  it('should test not empty fields', () => {
    const result = Validators.checkEmpty('not empty ', 'destination');
    expect(result.length).toBeFalsy();
  });

  it('should test for special characters and return an empty array', () => {
    const result = Validators.validateRegex('checkNumbersAndLetters', '11221', 'phoneNo');
    expect(result).toEqual([]);
  });

  it('should test fields with white space', () => {
    const result = Validators.validateEmptyAndSpaces('aa ', 'destination');
    expect(result[0]).toHaveProperty('error', 'Spaces are not allowed');
  });

  it('should test if date is hours from now and return an error message', () => {
    const date = moment().add(1, 'hours');
    const result = Validators.checkDateTimeIsHoursAfterNow(2, date, 'flightTime');
    const expectedProps = ['error', 'flightTime must be at least 2 hours from current time.'];
    expect(result[0]).toHaveProperty(...expectedProps);
  });

  it('should test if date is hours from now and return an empty array', () => {
    const date = moment().add(4, 'hours');
    const result = Validators.checkDateTimeIsHoursAfterNow(2, date, 'flightTime');
    expect(result).toEqual([]);
  });

  it('should test validate Travel contact details', () => {
    const payload = {
      submission: {
        noOfPassengers: '34',
        riderPhoneNo: '23223',
        travelTeamPhoneNo: '4343sd'
      }
    };
    const result = UserInputValidator.validateTravelContactDetails(payload);
    expect(result[0]).toHaveProperty('error', 'Only numbers are allowed. ');
    expect(result[1]).toHaveProperty('error', 'Minimum length is 6 digits');
  });
});

describe('validateCoordinates', () => {
  const payload = {
    submission: {
      coordinates: '1.000,1.000'
    }
  };
  it('is valid coordinates', async () => {
    const result = UserInputValidator.validateCoordinates(payload);
    expect(result.length).toEqual(0);
  });
  it('invalid', () => {
    payload.submission.coordinates = 'invalid coordinates';
    const result = UserInputValidator.validateCoordinates(payload);
    expect(result.length).toEqual(1);
  });
  describe('UserInputValidator_checkTimeFormat', () => {
    it('should respond with a message when an invalid time is passed', () => {
      const time = '08:A2';
      const res = Validators.checkTimeFormat(time, 'testField');
      const [SlackDialogError] = res;
      const { name, error } = SlackDialogError;
      expect(name).toEqual('testField');
      expect(error).toEqual('Invalid time');
    });
    it('should return an empty array when time is valid', () => {
      const time = '08:02';
      const res = Validators.checkTimeFormat(time, 'testField');
      expect(res).toEqual([]);
    });
  });
});
