import UserInputValidator from '../index';
import DateDialogHelper from '../../../dateHelper';
import {
  createPayload
} from '../../../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';

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

describe('UserInputValidator tests', () => {
  describe('checkWord', () => {
    it('should return an error when address contains special characters', () => {
      const errors = UserInputValidator.checkWord('13, Androse road $$$');
      expect(errors.length).toEqual(1);
    });
    it('should return an empty array when address is good', () => {
      const errors = UserInputValidator.checkWord('13, Androse road');
      expect(errors.length).toEqual(0);
    });
  });

  describe('checkOriginAnDestination', () => {
    it('should return errors when pickup and destination are NOT Others but are the same', () => {
      const errors = UserInputValidator.checkOriginAnDestination(
        'Andela-Nairobi', 'Andela-Nairobi', 'pickupName', 'destinationName'
      );
      expect(errors.length).toEqual(2);
    });
    it('should return errors when pickup and destination are NOT Others and NOT the same', () => {
      const errors = UserInputValidator.checkOriginAnDestination(
        'Andela-Nairobi', 'Andela-Kigali', 'pickupName', 'destinationName'
      );
      expect(errors.length).toEqual(0);
    });
  });

  describe('checkDate', () => {
    it('should return errors when date is less than now', () => {
      DateDialogHelper.dateChecker = jest.fn(() => -20);
      const errors = UserInputValidator.checkDate('10/10/2018 22:00', 3600);
      expect(errors.length).toEqual(1);
    });
    it('should return an empty array when date is greater than now', () => {
      DateDialogHelper.dateChecker = jest.fn(() => 20);
      const errors = UserInputValidator.checkDate('10/10/2050 22:00', 3600);
      expect(errors.length).toEqual(0);
    });
  });

  describe('checkDateFormat', () => {
    it('should return errors when date is NOT in Day/Month/Year HH:MM format', () => {
      DateDialogHelper.dateFormat = jest.fn(() => false);
      const errors = UserInputValidator.checkDateFormat('10/10/2018 22:00');
      expect(errors.length).toEqual(1);
    });
    it('should return an empty array when date is in Day/Month/Year HH:MM format', () => {
      DateDialogHelper.dateFormat = jest.fn(() => true);
      const errors = UserInputValidator.checkDateFormat('10/10/2050 22:00');
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
      UserInputValidator.checkDate = jest.fn(() => []);
      UserInputValidator.checkDateFormat = jest.fn(() => []);
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

  describe('checkUsername', () => {
    it('valid user name', () => {
      const result = UserInputValidator.checkUsername('dummyUser', 'driver');
      expect(result.length).toEqual(0);
    });
    it('invalid username', () => {
      let result = UserInputValidator.checkUsername('*****dummyUser*****', 'driver');
      expect(result.length).toEqual(1);
      result = UserInputValidator.checkUsername(null, 'driver');
      expect(result.length).toEqual(1);
    });
  });
});


describe('checkPhoneNumber', () => {
  it('valid phone number', () => {
    const result = UserInputValidator.checkPhoneNumber('23481234567', 'driver');
    expect(result.length).toEqual(0);
  });
  it('invalid phone number', () => {
    let result = UserInputValidator.checkPhoneNumber('*****dummyUser*****', 'driver');
    expect(result.length).toEqual(1);
    result = UserInputValidator.checkPhoneNumber('1233', 'driver');
    expect(result.length).toEqual(1);
    result = UserInputValidator.checkPhoneNumber(null, 'driver');
    expect(result.length).toEqual(1);
  });
});

describe('checkNumberPlate', () => {
  it('valid plate number', () => {
    let result = UserInputValidator.checkNumberPlate('LND 419 SMC', 'driver');
    expect(result.length).toEqual(0);
    result = UserInputValidator.checkNumberPlate('LND 419 smn', 'driver');
    expect(result.length).toEqual(0);
  });
  it('invalid plate number', () => {
    let result = UserInputValidator.checkNumberPlate('*****Invalid Plate******', 'driver');
    expect(result.length).toEqual(1);
    result = UserInputValidator.checkNumberPlate(null, 'driver');
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
