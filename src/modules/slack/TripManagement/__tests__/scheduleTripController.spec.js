import ScheduleTripController from '../ScheduleTripController';
import UserInputValidator from '../../../../helpers/slack/UserInputValidator';
import dateHelper from '../../../../helpers/dateHelper';
import {
  createPayload, tripRequestDetails, respondMock
} from '../../SlackInteractions/__mocks__/SlackInteractions.mock';

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    users: {
      info: jest.fn(() => Promise.resolve({
        user: { real_name: 'someName', profile: { email: 'someemial@email.com' } },
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

describe('ScheduleTripController Tests', () => {
  describe('validateTripDetailsForm', () => {
    it('should return date validation errors if they exist', async () => {
      UserInputValidator.validateLocationEntries = jest.fn(() => []);
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => []);
      const errors = await ScheduleTripController.validateTripDetailsForm('payload');
      expect(errors.length).toEqual(0);
    });
  });

  describe('getLocationIds', () => {
    it('should return originId and destinationId', async () => {
      ScheduleTripController.createLocation = jest.fn(() => 2);
      const payload = createPayload();
      const locationIds = await ScheduleTripController.getLocationIds(payload.submission);
      expect(locationIds).toEqual({ originId: 2, destinationId: 2 });
    });
  });

  describe('createRequestObject', () => {
    it('should return an object containing trip request details', async () => {
      ScheduleTripController.getLocationIds = jest.fn(() => 2);
      dateHelper.changeDateFormat = jest.fn(() => '22/12/2018 22:00');
      const request = await ScheduleTripController
        .createRequestObject(tripRequestDetails(), { id: 4 });
      expect(request).toHaveProperty('riderId', 4);
      expect(request).toHaveProperty('reason', tripRequestDetails().reason);
    });
  });

  describe('createRequest', () => {
    it('should return an object with details of the trip to persist', async () => {
      const payload = createPayload();
      ScheduleTripController.createUser = jest.fn(() => 4);
      ScheduleTripController.createRequestObject = jest.fn(() => tripRequestDetails());

      const request = await ScheduleTripController
        .createRequest(payload, payload.submission);
      expect(request).toHaveProperty('riderId', 4);
      expect(request).toHaveProperty('reason', tripRequestDetails().reason);
    });
  });

  describe('createTripRequest', () => {
    const responder = respondMock();
    it('should persist details of a trip', async () => {
      const payload = createPayload();
      ScheduleTripController.createUser = jest.fn(() => 4);
      ScheduleTripController.createRequest = jest.fn(() => tripRequestDetails());

      const request = await ScheduleTripController
        .createTripRequest(payload, responder, tripRequestDetails());
      expect(request).toEqual(true);
    });
  });

  describe('createLocation', () => {
    it('should persist details of a location', async () => {
      ScheduleTripController.createUser = jest.fn(() => 4);
      ScheduleTripController.createRequestObject = jest.fn(() => tripRequestDetails());

      const location = await ScheduleTripController
        .createLocation('13, Androse Road', 23, 25);
      expect(location).toEqual(2);
    });
  });

  describe('createUser', () => {
    it('should persist details of a user', async () => {
      const location = await ScheduleTripController.createUser('dummyId');
      expect(location).toEqual(4);
    });
  });
});
