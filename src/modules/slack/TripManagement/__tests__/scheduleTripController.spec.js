import ScheduleTripController from '../ScheduleTripController';
import UserInputValidator from '../../../../helpers/slack/UserInputValidator';
import Validators from '../../../../helpers/slack/UserInputValidator/Validators';
import dateHelper from '../../../../helpers/dateHelper';
import {
  createPayload, tripRequestDetails, respondMock
} from '../../SlackInteractions/__mocks__/SlackInteractions.mock';
import SlackEvents from '../../events';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import TripDetailsService from '../../../../services/TripDetailsService';
import tripService, { TripService } from '../../../../services/TripService';
import InteractivePromptSlackHelper from '../../helpers/slackHelpers/InteractivePromptSlackHelper';
import HomebaseService from '../../../../services/HomebaseService';
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

describe('Test PassedStatus Method', () => {
  const payload = createPayload();
  beforeEach(() => {
    jest.spyOn(Validators, 'checkDateTimeIsHoursAfterNow').mockReturnValue([]);
    jest.spyOn(UserInputValidator, 'validatePickupDestinationEntry').mockResolvedValue([]);
    jest.spyOn(Validators, 'validateDialogSubmission').mockReturnValue([]);
    jest.spyOn(UserInputValidator, 'validateLocationEntries').mockReturnValue([]);
    jest.spyOn(UserInputValidator, 'validateDateAndTimeEntry').mockResolvedValue([]);
    jest.spyOn(UserInputValidator, 'validateTravelFormSubmission').mockReturnValue([]);
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });


  it('should test PassedStatus Method when status is "pickup"', async () => {
    const {
      submission
    } = payload;
    const travelDateTime = submission.flightDateTime;
    const result = await ScheduleTripController
      .passedStatus(submission, payload, 'pickup', travelDateTime, 'flightDateTime', 3);
    expect(result.length).toBe(0);
  });
  it('should test PassedStatus Method when status is "destination"', async () => {
    const {
      submission
    } = payload;
    const travelDateTime = submission.flightDateTime;
    const result = await ScheduleTripController
      .passedStatus(submission, payload, 'destination', travelDateTime, 'flightDateTime', 3);
    expect(result.length).toBe(0);
  });
  it('should test PassedStatus Method when status is "standard"', async () => {
    const {
      submission
    } = payload;
    const travelDateTime = submission.flightDateTime;
    const result = await ScheduleTripController
      .passedStatus(submission, payload, 'standard', travelDateTime, 'flightDateTime', 3);
    expect(result.length).toBe(0);
  });
});

describe.only('ScheduleTripController Tests', () => {
  describe('validateTripDetailsForm', () => {
    let payload;

    beforeEach(() => {
      payload = createPayload();
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('xxxx');
      jest.spyOn(UserInputValidator, 'fetchUserInformationFromSlack').mockResolvedValue({ tz_offset: 1000 });
    });

    it('should return date validation errors if they exist for pickup dialog', async () => {
      const errors = await ScheduleTripController.validateTripDetailsForm(payload, 'pickup');
      expect(errors.length).toEqual(1);
      expect(errors).toContainEqual({ name: 'dateTime', error: 'Date cannot be in the past.' });
    });
    it('should return date validation errors if they exist for destination dialog', async () => {
      Validators.validateDialogSubmission = jest.fn(() => []);
      UserInputValidator.validateLocationEntries = jest.fn(() => []);
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => []);
      UserInputValidator
        .validatePickupDestinationLocationEntries = jest.fn(() => []);
      const errors = await ScheduleTripController.validateTripDetailsForm('payload', 'destination');
      expect(errors.length).toEqual(0);
    });

    it('should return an empty array if no errors in submission for destination', async () => {
      UserInputValidator.validateLocationEntries = jest.fn(() => []);
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => []);
      const errors = await ScheduleTripController.validateTripDetailsForm(payload, 'destination');
      expect(errors.length).toEqual(0);
    });

    it('should throw an error', async () => {
      try {
        UserInputValidator.validateDateAndTimeEntry = rejectMock;
        await ScheduleTripController.validateTripDetailsForm('payload', 'pickup');
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
      expect(locationIds).toEqual({ originId: expect.any(Number), destinationId: expect.any(Number) });
    });
    it('should return originId and destinationId for "Others"', async () => {
      ScheduleTripController.createLocation = jest.fn(() => 2);
      const tripData = tripRequestDetails();
      tripData.pickup = 'Others';
      tripData.destination = 'Others';

      const locationIds = await ScheduleTripController.getLocationIds(tripData);
      expect(locationIds).toEqual({ originId: expect.any(Number), destinationId: expect.any(Number) });
    });
  });

  describe('createRequestObject', () => {
    beforeEach(() => {
      jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockResolvedValue({ id: 1, name: 'Nairobi' });
    });

    it('should return an object containing trip request details', async () => {
      ScheduleTripController.getLocationIds = jest.fn(() => 2);
      dateHelper.changeDateTimeFormat = jest.fn(() => '22/12/2018 22:00');
      const request = await ScheduleTripController
        .createRequestObject(tripRequestDetails(), { id: 4, slackId: 'XXXX' });
      expect(request).toHaveProperty('riderId', 4);
      expect(request).toHaveProperty('reason', tripRequestDetails().reason);
      expect(request).toHaveProperty('homebaseId', 1);
    });

    it('should return an object containing trip request details when "pickup" is Others', async () => {
      ScheduleTripController.getLocationIds = jest.fn(() => 2);
      dateHelper.changeDateTimeFormat = jest.fn(() => '22/12/2018 22:00');
      const tripData = tripRequestDetails();
      tripData.pickup = 'Others';
      tripData.destination = 'Others';
      const request = await ScheduleTripController
        .createRequestObject(tripData, {
          id: 4
        });
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
      jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockResolvedValue({ id: 1, name: 'Nairobi' });
    });
    it('should return an object with details of the trip to persist', async () => {
      SlackHelpers.findOrCreateUserBySlackId = jest.fn(() => 4);
      SlackHelpers.getUserInfoFromSlack = jest.fn(() => 4);
      jest.spyOn(SlackHelpers, 'getUserInfoFromSlack')
        .mockResolvedValue({ tz: 'Africa/Lagos' });
      ScheduleTripController.createRequestObject = jest.fn(() => tripRequestDetails());
      const request = await ScheduleTripController
        .createRequest(payload, payload.submission);
      expect(request).toHaveProperty('riderId', 4);
      expect(request).toHaveProperty('reason', tripRequestDetails().reason);
    });

    it('should return an object with details of the trip to persist when forMe is false',
      async () => {
        payload.submission.forMe = false;
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
    afterAll(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should persist details of a trip', async () => {
      const payload = createPayload();
      jest.spyOn(ScheduleTripController, 'createRequest')
        .mockResolvedValue(tripRequestDetails());
      jest.spyOn(TripService, 'createRequest')
        .mockResolvedValue({ dataValues: 'someValue' });
      jest.spyOn(InteractivePromptSlackHelper, 'sendCompletionResponse')
        .mockImplementation(jest.fn());
      jest.spyOn(SlackEvents, 'raise').mockImplementation(jest.fn());

      const request = await ScheduleTripController
        .createTripRequest(payload, responder, tripRequestDetails());

      expect(request).toEqual({ dataValues: 'someValue' });
      expect(SlackEvents.raise).toBeCalled();
      expect(TripService.createRequest).toBeCalled();
    });

    it('should persist details of a trip', async () => {
      const payload = createPayload();
      try {
        jest.spyOn(ScheduleTripController, 'createRequest')
          .mockImplementation(() => { throw err; });

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
    jest.spyOn(TripDetailsService, 'createDetails')
      .mockImplementation(() => { throw err; });
    try {
      await ScheduleTripController.createTripDetail(tripInfo);
    } catch (error) {
      expect(error).toEqual(err);
    }
  });
});


describe('Create Travel Trip request test', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should create trip request', async () => {
    const createRequestSpy = jest.spyOn(ScheduleTripController, 'createRequest')
      .mockResolvedValue({ trip: 'Lekki' });
    const createTripDetailSpy = jest.spyOn(ScheduleTripController, 'createTripDetail')
      .mockResolvedValue({ id: 12 });
    const createTripRequestSpy = jest.spyOn(TripService, 'createRequest')
      .mockResolvedValue({ id: 1 });
    const getByIdSpy = jest.spyOn(tripService, 'getById')
      .mockResolvedValue({ id: 'data', newPayload: 'payload' });

    const payload = createPayload();

    const result = await ScheduleTripController.createTravelTripRequest(payload, {});

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('newPayload');
    expect(createRequestSpy).toBeCalledTimes(1);
    expect(createTripDetailSpy).toBeCalledTimes(1);
    expect(createTripRequestSpy).toBeCalledTimes(1);
    expect(getByIdSpy).toBeCalledTimes(1);
  });

  it('should throw an error', async () => {
    jest.spyOn(ScheduleTripController, 'createRequest')
      .mockImplementation(() => { throw err; });

    const payload = createPayload();
    try {
      await ScheduleTripController.createTravelTripRequest(payload, 'trip');
    } catch (error) {
      expect(error).toEqual(new Error('Dummy error'));
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
      jest.spyOn(ScheduleTripController, 'passedStatus').mockResolvedValue([]);
      UserInputValidator.validateLocationEntries = jest.fn(() => errorMock);
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => errorMock);
      const payload = createPayload();
      const result = await ScheduleTripController.validateTravelDetailsForm(payload, 'embassy');
      expect(result.length).toBe(0);
    });

    it('should test validateTravelDetailsForm Method for embassy visit', async () => {
      jest.spyOn(ScheduleTripController, 'passedStatus').mockResolvedValue([]);
      UserInputValidator.validateLocationEntries = jest.fn(() => errorMock);
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => errorMock);
      const payload = createPayload();
      const result = await ScheduleTripController.validateTravelDetailsForm(payload, 'embassy');
      expect(result.length).toBe(0);
    });
    it('should test validateTravelDetailsForm Method for flight date Time', async () => {
      jest.spyOn(ScheduleTripController, 'passedStatus').mockResolvedValue([]);
      UserInputValidator.validateLocationEntries = jest.fn(() => errorMock);
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => errorMock);
      const payload = createPayload();
      delete payload.submission.flightDateTime;
      const result = await ScheduleTripController.validateTravelDetailsForm(payload, 'flight');
      expect(result.length).toBe(0);
    });


    it('should test validateTravelDetailsForm', async () => {
      UserInputValidator.validateTravelDetailsForm = jest.fn(() => {
        throw new Error('Not working');
      });
      UserInputValidator.validateDateAndTimeEntry = jest.fn(() => errorMock);
      jest.spyOn(Validators, 'checkDateTimeIsHoursAfterNow').mockResolvedValue(errorMock);

      try {
        await ScheduleTripController.validateTravelDetailsForm('payload');
      } catch (error) {
        expect(error.message).toEqual("Cannot read property 'flightDateTime' of undefined");
      }
    });
  });
});
