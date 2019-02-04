import ScheduleTripController from '../ScheduleTripController';
import UserInputValidator from '../../../../helpers/slack/UserInputValidator';
import Validators from '../../../../helpers/slack/UserInputValidator/Validators';
import dateHelper from '../../../../helpers/dateHelper';
import {
  createPayload, tripRequestDetails, respondMock
} from '../../SlackInteractions/__mocks__/SlackInteractions.mock';
import models from '../../../../database/models';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import SlackEvents from '../../events';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';

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
      dateHelper.changeDateTimeFormat = jest.fn(() => '22/12/2018 22:00');
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
      SlackHelpers.findOrCreateUserBySlackId = jest.fn(() => 4);
      ScheduleTripController.createRequestObject = jest.fn(() => tripRequestDetails());
      const request = await ScheduleTripController
        .createRequest(payload, payload.submission);
      expect(request).toHaveProperty('riderId', 4);
      expect(request).toHaveProperty('reason', tripRequestDetails().reason);
    });

    it('should return an object with details of the trip to persist when forSelf is false',
      async () => {
        payload.submission.forSelf = 'false';
        SlackHelpers.findOrCreateUserBySlackId = jest.fn(() => ({ id: 4 }));
        ScheduleTripController.createRequestObject = jest.fn(() => tripRequestDetails());

        const request = await ScheduleTripController
          .createRequest(payload, payload.submission);
        expect(SlackHelpers.findOrCreateUserBySlackId).toBeCalledTimes(2);
        expect(request).toHaveProperty('riderId', 4);
        expect(request).toHaveProperty('reason', tripRequestDetails().reason);
      });

    it('should throw error', async () => {
      SlackHelpers.findOrCreateUserBySlackId = rejectMock;
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
      const { TripRequest } = models;
      TripRequest.create = jest.fn(() => ({ dataValues: 'someValue' }));
      InteractivePrompts.sendCompletionResponse = jest.fn();
      SlackEvents.raise = jest.fn();
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

describe('Create trip Detail test', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  it('should create TripDetail', async () => {
    const tripInfo = {
      riderPhoneNo: '900009',
      travelTeamPhoneNo: '900009',
      flightNumber: '9AA09'
    };

    const result = await ScheduleTripController.createTripDetail(tripInfo);
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
    expect(result).toHaveProperty('id');
  });

  it("should throw an error when tripDetail isn't created", async () => {
    const tripInfo = {
      riderPhoneNo: '',
      travelTeamPhoneNo: '',
      flightNumber: ''
    };
    const { TripDetail } = models;
    TripDetail.create = rejectMock;
    try {
      await ScheduleTripController.createTripDetail(tripInfo);
    } catch (error) {
      expect(error).toEqual(err);
    }
  });
});


describe('Create Travel Trip request test', () => {
  const { TripRequest } = models;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create trip request', async () => {
    ScheduleTripController.createRequest = jest.fn(() => ({ trip: 'Lekki' }));
    ScheduleTripController.createTripDetail = jest.fn(() => ({ id: 12 }));
    TripRequest.create = jest.fn(() => ({ dataValues: { id: 1 } }));
    InteractivePrompts.sendCompletionResponse = jest.fn();
    SlackEvents.raise = jest.fn();
    const payload = createPayload();
    const respond = jest.fn();

    const result = await ScheduleTripController.createTravelTripRequest(payload, respond, 'trip');
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('newPayload');
  });

  it('should throw an error', async () => {
    ScheduleTripController.createRequest = jest.fn(() => ({ trip: 'Lekki' }));
    ScheduleTripController.createTripDetail = jest.fn(() => ({ id: 12 }));
    TripRequest.create = jest.fn(() => { throw new Error('failed'); });

    const payload = createPayload();
    const respond = jest.fn();
    try {
      await ScheduleTripController.createTravelTripRequest(payload, respond, 'trip');
    } catch (error) {
      expect(error).toEqual(new Error('failed'));
    }
  });
  describe('Validate travel form test', () => {
    const errorMock = [{ boy: 'bou' }];
    it('should test validateTravelContactDetails Method', () => {
      UserInputValidator.validateTravelContactDetails = jest.fn(() => (errorMock));
      const result = ScheduleTripController.validateTravelContactDetailsForm('payload');
      expect(result).toEqual(errorMock);
    });

    it('should test validateTravelDetailsForm Method', async () => {
      UserInputValidator.validateTravelDetailsForm = jest.fn(() => (errorMock));
      UserInputValidator.validateLocationEntries = jest.fn(() => errorMock);
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => errorMock);
      const payload = createPayload();
      const result = await ScheduleTripController.validateTravelDetailsForm(payload, 'tripType');
      expect(result[0]).toEqual(errorMock[0]);
    });


    it('should test validateTravelDetailsForm', async () => {
      UserInputValidator.validateTravelDetailsForm = jest.fn(() => {
        throw new Error('Not working');
      });
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => errorMock);
      Validators.checkDateTimeIsHoursAfterNow = jest.fn(() => errorMock);

      try {
        await ScheduleTripController.validateTravelDetailsForm('payload');
      } catch (error) {
        expect(error.message).toEqual("Cannot read property 'flightDateTime' of undefined");
      }
    });
  });
});
