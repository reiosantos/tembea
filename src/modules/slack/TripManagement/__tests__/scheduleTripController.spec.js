import ScheduleTripController from '../ScheduleTripController';
import UserInputValidator from '../../../../helpers/slack/UserInputValidator';
import dateHelper from '../../../../helpers/dateHelper';
import {
  createPayload, tripRequestDetails, respondMock
} from '../../SlackInteractions/__mocks__/SlackInteractions.mock';
import models from '../../../../database/models';
import TeamDetailsService from '../../../../services/TeamDetailsService';

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

const err = new Error('Dummy error');
const rejectMock = jest.fn(() => Promise.reject(err));

describe('ScheduleTripController Tests', () => {
  describe('createUser', () => {
    const { User } = models;
    const userId = 'dummyId';
    const teamId = 'TEAMID2';
    const slackBotOauthToken = 'BOTTOKEN2';
    let getTeamDetailsBotOauthTokenSpy;
    beforeEach(() => {
      getTeamDetailsBotOauthTokenSpy = jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken');
      getTeamDetailsBotOauthTokenSpy.mockImplementation(() => slackBotOauthToken);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create and return user', async () => {
      const slackUserMock = { real_name: 'dummyReal', profile: { email: 'dummyReal@local.host' } };
      UserInputValidator.fetchUserInformationFromSlack = jest.fn(() => (slackUserMock));
      User.findOrCreate = jest.fn(() => ([{ dataValues: {} }]));
      const user = await ScheduleTripController
        .createUser(userId, teamId);
      expect(UserInputValidator.fetchUserInformationFromSlack).toBeCalledWith(userId, slackBotOauthToken);
      const expected = {
        where: { slackId: userId },
        defaults: { name: slackUserMock.real_name, email: slackUserMock.profile.email }
      };
      expect(User.findOrCreate).toBeCalledWith(expected);
      expect(user).toEqual({});
    });

    it('should throw an error', async () => {
      try {
        UserInputValidator.fetchUserInformationFromSlack = rejectMock;
        await ScheduleTripController
          .createUser(userId, teamId);
      } catch (e) {
        expect(e)
          .toEqual(err);
      }
    });
  });

  describe('createLocation', () => {
    const { Location, Address } = models;
    const longitude = 23;
    const latitude = 25;
    const address = '13, Androse Road';

    it('should persist details of a location', async () => {
      Location.findOrCreate = jest.fn(() => ([{ dataValues: { id: 1 } }]));
      Address.create = jest.fn(() => ({ dataValues: { id: 12 } }));
      const location = await ScheduleTripController
        .createLocation(address, longitude, latitude);
      expect(Location.findOrCreate).toBeCalledWith({ where: { longitude, latitude } });
      expect(Address.create).toBeCalledWith({ address, locationId: 1, });
      expect(location).toEqual(12);
    });

    it('should throw an error', async () => {
      try {
        Location.findOrCreate = rejectMock;
        await ScheduleTripController
          .createLocation(address, longitude, latitude);
      } catch (e) {
        expect(e).toEqual(err);
      }
    });
  });

  describe('validateTripDetailsForm', () => {
    it('should return date validation errors if they exist', async () => {
      UserInputValidator.validateLocationEntries = jest.fn(() => []);
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => []);
      const errors = await ScheduleTripController.validateTripDetailsForm('payload');
      expect(errors.length).toEqual(0);
    });
    it('should throw an error', async () => {
      try {
        UserInputValidator.validateDateAndTimeEntry = rejectMock;
        await ScheduleTripController.validateTripDetailsForm('payload');
      } catch (e) {
        expect(e).toEqual(err);
      }
    });
  });

  describe('getLocationIds', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });
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

    it('should throw an error', async () => {
      try {
        ScheduleTripController.getLocationIds = rejectMock;
        await ScheduleTripController
          .createRequestObject(tripRequestDetails(), { id: 4 });
      } catch (e) {
        expect(e).toEqual(err);
      }
    });
  });

  describe('createRequest', () => {
    let payload;
    beforeEach(() => {
      payload = createPayload();
    });
    it('should return an object with details of the trip to persist', async () => {
      ScheduleTripController.createUser = jest.fn(() => 4);
      ScheduleTripController.createRequestObject = jest.fn(() => tripRequestDetails());
      const request = await ScheduleTripController
        .createRequest(payload, payload.submission);
      expect(request).toHaveProperty('riderId', 4);
      expect(request).toHaveProperty('reason', tripRequestDetails().reason);
    });

    it('should return an object with details of the trip to persist when forSelf is false',
      async () => {
        payload.submission.forSelf = 'false';
        ScheduleTripController.createUser = jest.fn(() => ({ id: 4 }));
        ScheduleTripController.createRequestObject = jest.fn(() => tripRequestDetails());

        const request = await ScheduleTripController
          .createRequest(payload, payload.submission);
        expect(ScheduleTripController.createUser).toBeCalledTimes(2);
        expect(request).toHaveProperty('riderId', 4);
        expect(request).toHaveProperty('reason', tripRequestDetails().reason);
      });

    it('should throw error', async () => {
      ScheduleTripController.createUser = rejectMock;
      ScheduleTripController.createRequestObject = jest.fn(() => tripRequestDetails());
      try {
        await ScheduleTripController
          .createRequest(payload, payload.submission);
      } catch (e) {
        expect(e).toEqual(err);
      }
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

    it('should persist details of a trip', async () => {
      const payload = createPayload();
      try {
        ScheduleTripController.createRequest = rejectMock;

        await ScheduleTripController
          .createTripRequest(payload, responder, tripRequestDetails());
      } catch (e) {
        expect(e).toEqual(err);
      }
    });
  });
});
