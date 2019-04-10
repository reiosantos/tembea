import ScheduleTripInputHandlers, {
  createDepartmentPayloadObject,
} from '../index';
import InteractivePrompts from '../../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../modules/slack/SlackPrompts/DialogPrompts';
import ScheduleTripController
  from '../../../../modules/slack/TripManagement/ScheduleTripController';
import {
  responseMessage, createTripPayload, respondMock,
  createPickupPayload, createDestinationPayload,
  createTripData, createTripDetails
} from '../../../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';
import Cache from '../../../../cache';
import Validators from '../../UserInputValidator/Validators';
import LocationHelpers from '../../../googleMaps/locationsMapHelpers';
import UserInputValidator from '../../UserInputValidator';

jest.mock('../../../../modules/slack/events/', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));

jest.mock('../../../../modules/slack/events/slackEvents', () => ({
  SlackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
  slackEventNames: Object.freeze({
    TRIP_APPROVED: 'trip_approved',
    TRIP_WAITING_CONFIRMATION: 'trip_waiting_confirmation',
    NEW_TRIP_REQUEST: 'new_trip_request',
    DECLINED_TRIP_REQUEST: 'declined_trip_request'
  })
}));

describe('ScheduleTripInputHandlers Tests', () => {
  const payload = createTripPayload('dummyValue');
  let responder;

  beforeAll(() => {
    responder = respondMock();
    Cache.fetch = jest.fn(() => ({ forSelf: 'true' }));
    Cache.save = jest.fn();
    jest.spyOn(Validators, 'validateDialogSubmission')
      .mockReturnValue([]);
    jest.spyOn(LocationHelpers, 'locationVerify');
    jest.spyOn(LocationHelpers, 'locationSuggestions');
    jest.spyOn(InteractivePrompts, 'sendScheduleTripResponse');
    InteractivePrompts.sendSelectDestination = jest.fn(() => {});
    InteractivePrompts.sendListOfDepartments = jest.fn(() => {});
    InteractivePrompts.sendRiderSelectList = jest.fn(() => {});
    InteractivePrompts.sendAddPassengersResponse = jest.fn(() => {});
    InteractivePrompts.sendCompletionResponse = jest.fn(() => {});
    DialogPrompts.sendTripDetailsForm = jest.fn(() => {});
    ScheduleTripController.createTripRequest = jest.fn(() => 1);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });


  describe('Response to "reason" dialog', () => {
    it('should respond with list of departments', async () => {
      await ScheduleTripInputHandlers.reason(payload, responder);
      expect(InteractivePrompts.sendAddPassengersResponse)
        .toHaveBeenCalledWith(responder);
    });

    it('should respond with list of users', async () => {
      Cache.fetch = jest.fn(() => ({ forSelf: 'false' }));
      jest.spyOn(Validators, 'validateDialogSubmission')
        .mockReturnValue([]);
      await ScheduleTripInputHandlers.reason(payload, responder, 'reason');
      expect(InteractivePrompts.sendRiderSelectList)
        .toHaveBeenCalledWith(payload, responder);
    });
    it('should return errors if they exist', async () => {
      jest.spyOn(Validators, 'validateDialogSubmission')
        .mockReturnValue([{ label: 'label', name: 'name' }]);
      const errors = await ScheduleTripInputHandlers.reason(payload, responder, 'reason');
      expect(errors.errors).toEqual([{ label: 'label', name: 'name' }]);
    });
  });

  describe('createDepartmentPayloadObject', () => {
    it('should return navigation callbackId of "schedule_trip_reason"', () => {
      const result = createDepartmentPayloadObject(payload, responder);
      expect(result.navButtonCallbackId)
        .toEqual('schedule_trip_reason');
    });

    it('should return navigation callbackId of "schedule_trip_rider"', () => {
      const result = createDepartmentPayloadObject(payload, responder, 'false');
      expect(result.navButtonCallbackId)
        .toEqual('schedule_trip_rider');
    });
  });


  describe('Response to "rider" interaction', () => {
    it('should respond with list of departments', async () => {
      await ScheduleTripInputHandlers.rider(payload, responder, 'rider');
      expect(InteractivePrompts.sendAddPassengersResponse)
        .toHaveBeenCalledWith(responder, 'false');
    });
  });

  describe('Response to "addPassengers" interaction', () => {
    it('should respond with message to add passengers', async () => {
      Cache.fetch = jest.fn(() => ({ forSelf: 'false' }));
      await ScheduleTripInputHandlers.addPassengers(payload, responder);
      expect(InteractivePrompts.sendListOfDepartments)
        .toHaveBeenCalled();
    });
    it('should respond with message to add passengers for "selected options"', async () => {
      const tripPayload = {
        user: { id: '3' },
        actions: [{ name: 'dummy', selected_options: [{ value: 'dummy', name: 'dummy' }] }],
      };
      Cache.fetch = jest.fn(() => ({ forSelf: 'false' }));
      await ScheduleTripInputHandlers.addPassengers(tripPayload, responder);
      expect(InteractivePrompts.sendListOfDepartments)
        .toHaveBeenCalled();
    });
  });

  describe('Response to "department" interaction', () => {
    it('should respond with trip details dialog form', async () => {
      await ScheduleTripInputHandlers.department(payload, responder, 'department');
      expect(responder).toHaveBeenCalledWith(responseMessage('Noted...'));
      expect(DialogPrompts.sendTripDetailsForm)
        .toHaveBeenCalledWith(payload, 'regularTripForm',
          'schedule_trip_tripPickup', 'Pickup Details');
    });
  });

  describe('Response to "tripPickup" interaction', () => {
    const pickupPayload = createPickupPayload('dummyData');
    beforeEach(() => {
      jest.spyOn(Cache, 'save');
      jest.spyOn(Cache, 'fetch').mockResolvedValue({
        id: '1',
        department: {
          value: 'dummy'
        },
        tripDetails: {}
      });
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should respond with interactive prompt', async () => {
      jest.spyOn(ScheduleTripController, 'validateTripDetailsForm').mockResolvedValue([]);
      const result = jest.spyOn(InteractivePrompts, 'sendSelectDestination');
      await ScheduleTripInputHandlers.tripPickup(pickupPayload, responder);
      expect(result)
        .toHaveBeenCalled();
    });
    it('should respond with pickup details dialog form', async () => {
      pickupPayload.submission.pickup = 'Others';
      jest.spyOn(ScheduleTripController, 'validateTripDetailsForm').mockResolvedValue([]);
      await ScheduleTripInputHandlers.tripPickup(pickupPayload, responder);
      expect(LocationHelpers.locationVerify)
        .toHaveBeenCalledWith(pickupPayload.submission, 'pickup', 'schedule_trip');
    });
  });

  describe('Response to "tripPickup" dialog', () => {
    const pickupPayload = createPickupPayload('dummyData');
    it('should return errors if they exist', async () => {
      jest.spyOn(ScheduleTripController, 'validateTripDetailsForm')
        .mockReturnValue([{ label: 'label', name: 'name' }]);

      const errors = await ScheduleTripInputHandlers
        .tripPickup(pickupPayload, responder);
      expect(errors.errors.length).toEqual(1);
    });
    it('should send a fail response when an error occurs', async () => {
      jest.spyOn(InteractivePrompts, 'sendSelectDestination').mockRejectedValue(new Error('Error'));
      await ScheduleTripInputHandlers.tripPickup(pickupPayload, responder);
      expect(responder).toHaveBeenCalled();
    });
  });

  describe('Response to "destinationSelection" interaction', () => {
    const pickupPayload = createPickupPayload('dummyData');
    it('should respond with destination details dialog form', async () => {
      await ScheduleTripInputHandlers.destinationSelection(pickupPayload, responder);
      expect(DialogPrompts.sendTripDetailsForm)
        .toHaveBeenCalledWith(pickupPayload, 'tripDestinationLocationForm',
          'schedule_trip_confirmDestination', 'Destination Details');
    });
    it('should send a fail response when an error occurs', async () => {
      DialogPrompts.sendTripDetailsForm.mockImplementation(() => {
        throw new Error();
      });
      await ScheduleTripInputHandlers.destinationSelection(pickupPayload, responder);
      expect(responder).toHaveBeenCalledTimes(2);
    });
  });

  describe('Response to "confirmDestination" interaction', () => {
    const destinationPayload = createDestinationPayload('dummyData');
    const tripDetails = createTripDetails();

    beforeEach(() => {
      jest.spyOn(Cache, 'save');
      jest.spyOn(Cache, 'fetch').mockResolvedValue({
        id: '1',
        department: {
          value: 'dummy'
        },
        tripDetails: {}
      });
      ScheduleTripController.validateTripDetailsForm = jest
        .fn(() => []);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should respond with preview summary of trip details', async () => {
      await ScheduleTripInputHandlers.confirmDestination(destinationPayload, responder);
      expect(InteractivePrompts.sendScheduleTripResponse)
        .toHaveBeenCalled();
    });

    it('should respond with Google static map destination details', async () => {
      destinationPayload.submission.destination = 'Others';
      await ScheduleTripInputHandlers.confirmDestination(destinationPayload, responder);
      expect(LocationHelpers.locationVerify)
        .toHaveBeenCalled();
    });
    it('should send a fail response when an error occurs', async () => {
      ScheduleTripController.validateTripDetailsForm = jest.fn();
      Cache.fetch = jest.fn(() => tripDetails);
      jest.spyOn(InteractivePrompts, 'sendScheduleTripResponse')
        .mockRejectedValue(new Error('Error'));
      await ScheduleTripInputHandlers.confirmDestination(tripDetails, responder);
      expect(responder).toHaveBeenCalled();
    });
    it('should return errors if they exist', async () => {
      jest.spyOn(ScheduleTripController, 'validateTripDetailsForm')
        .mockReturnValue([{ label: 'label', name: 'name' }]);

      const errors = await ScheduleTripInputHandlers
        .confirmDestination(destinationPayload, responder);
      expect(errors.errors.length).toEqual(1);
    });
  });
  describe('Response to "detailsConfirmation" interaction', () => {
    const destinationPayload = createDestinationPayload('dummyData');
    const tripDetails = createTripData();
    beforeEach(() => {
      jest.spyOn(Cache, 'save');
      jest.spyOn(Cache, 'fetch').mockResolvedValue({
        id: '1',
        department: {
          value: 'dummy'
        },
        tripDetails: {}
      });
      ScheduleTripController.validateTripDetailsForm = jest.fn(() => []);
      jest.spyOn(UserInputValidator, 'getScheduleTripDetails').mockReturnValue(tripDetails);
    });
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should respond with preview summary of trip details', async () => {
      await ScheduleTripInputHandlers.detailsConfirmation(destinationPayload, responder);
      expect(InteractivePrompts.sendScheduleTripResponse)
        .toHaveBeenCalled();
    });

    it('should return users to destination dialog box', async () => {
      tripDetails.destination = 'andela';
      jest.spyOn(UserInputValidator, 'getScheduleTripDetails').mockReturnValue(tripDetails);
      await ScheduleTripInputHandlers.detailsConfirmation(destinationPayload, responder);
      expect(DialogPrompts.sendTripDetailsForm)
        .toHaveBeenCalledWith(destinationPayload, 'tripDestinationLocationForm',
          'schedule_trip_confirmDestination', 'Destination Details');
    });
    it('should send a fail response when an error occurs', async () => {
      Cache.fetch = jest.fn(() => tripDetails);
      jest.spyOn(InteractivePrompts, 'sendScheduleTripResponse')
        .mockRejectedValue(new Error('Error'));
      await ScheduleTripInputHandlers.detailsConfirmation(tripDetails, responder);
      expect(responder).toHaveBeenCalled();
    });
  });

  describe('Response to "confirmation" dialog', () => {
    const destinationPayload = createDestinationPayload('dummyData');
    const tripDetails = createTripData();

    it('should schedule a new Trip', async () => {
      Cache.fetch = jest.fn(() => tripDetails);
      await ScheduleTripInputHandlers.confirmation(destinationPayload, responder, tripDetails);
      expect(ScheduleTripController.createTripRequest)
        .toHaveBeenCalled();
    });

    it('should send a fail response when an error occurs', async () => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue({
        id: '1',
        department: {
          value: 'dummy'
        },
        tripDetails: {}
      });
      ScheduleTripController.createTripRequest.mockImplementation(() => {
        throw new Error();
      });
      ScheduleTripController.validateTripDetailsForm = jest.fn(() => []);
      await ScheduleTripInputHandlers.confirmation(destinationPayload, responder);
      expect(responder).toHaveBeenCalledTimes(1);
    });
  });
  describe('Response to "suggestions" dialog', () => {
    it('should return "schedule trip" route', async () => {
      await ScheduleTripInputHandlers.suggestions(payload, responder, 'name', 'schedule_trip');
      expect(LocationHelpers.locationSuggestions)
        .toHaveBeenCalled();
    });
    it('should send a fail response when an error occurs', async () => {
      LocationHelpers.locationSuggestions.mockImplementation(() => {
        throw new Error();
      });
      await ScheduleTripInputHandlers.suggestions(payload, responder);
      expect(responder).toHaveBeenCalledTimes(1);
    });
  });
  describe('Response to "locatNotFound" dialog', () => {
    it('should return a response of location not found', async () => {
      await ScheduleTripInputHandlers.locationNotFound(payload, responder);
      expect(responder)
        .toHaveBeenCalled();
    });
  });
});
