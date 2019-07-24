import ScheduleTripInputHandlers, {
  createDepartmentPayloadObject,
} from '../index';
import InteractivePrompts from '../../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../modules/slack/SlackPrompts/DialogPrompts';
import ScheduleTripController
  from '../../../../modules/slack/TripManagement/ScheduleTripController';
import {
  createTripPayload, respondMock,
  createPickupPayload, createDestinationPayload,
  createTripData, createTripDetails
} from '../../../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';
import Cache from '../../../../cache';
import Validators from '../../UserInputValidator/Validators';
import LocationHelpers from '../../../googleMaps/locationsMapHelpers';
import UserInputValidator from '../../UserInputValidator';
import TripHelper from '../../../TripHelper';
import UpdateSlackMessageHelper from '../../updatePastMessageHelper';
import { bugsnagHelper } from '../../../../modules/slack/RouteManagement/rootFile';
import InteractivePromptSlackHelper from '../../../../modules/slack/helpers/slackHelpers/InteractivePromptSlackHelper';

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
    InteractivePromptSlackHelper.sendCompletionResponse = jest.fn(() => {});
    DialogPrompts.sendTripDetailsForm = jest.fn(() => {});
    ScheduleTripController.createTripRequest = jest.fn(() => 1);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });


  describe('Response to "reason" dialog', () => {
    it('should respond with list of departments', async () => {
      jest.spyOn(UpdateSlackMessageHelper, 'updateMessage').mockReturnValue({});
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
      expect(DialogPrompts.sendTripDetailsForm)
        .toHaveBeenCalledWith(payload, 'regularTripForm',
          'schedule_trip_tripPickup', 'Pickup Details');
    });
  });

  describe('Response to "tripPickup" interaction', () => {
    const pickupPayload = createPickupPayload('dummyData');
    beforeEach(() => {
      jest.spyOn(Cache, 'saveObject');
      jest.spyOn(Cache, 'fetch').mockResolvedValue({
        id: '1',
        department: {
          value: 'dummy'
        },
        tripDetails: {}
      });
      jest.spyOn(TripHelper, 'updateTripData').mockResolvedValue({});
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should respond with interactive prompt', async () => {
      jest.spyOn(UpdateSlackMessageHelper, 'updateMessage').mockReturnValue({});
      jest.spyOn(ScheduleTripController, 'validateTripDetailsForm').mockResolvedValue([]);
      const result = jest.spyOn(InteractivePrompts, 'sendSelectDestination');
      await ScheduleTripInputHandlers.tripPickup(pickupPayload, responder);
      expect(result)
        .toHaveBeenCalledWith(responder);
      expect(UpdateSlackMessageHelper.updateMessage).toBeCalledTimes(1);
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
      expect(responder).toHaveBeenCalledTimes(1);
    });
  });

  describe('Response to "confirmDestination" interaction', () => {
    const destinationPayload = createDestinationPayload('dummyData');
    const tripDetails = createTripDetails();

    beforeEach(() => {
      jest.spyOn(Cache, 'saveObject');
      jest.spyOn(Cache, 'fetch').mockResolvedValue({
        id: '1',
        department: {
          value: 'dummy'
        },
        tripDetails: {
          pickup: 'dummy',
          othersPickup: null,
        }
      });
      ScheduleTripController.validateTripDetailsForm = jest
        .fn(() => []);
      jest.spyOn(TripHelper, 'getDestinationCoordinates').mockResolvedValue({});
    });
    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should respond with preview summary of trip details - confirmDestination', async () => {
      jest.spyOn(UpdateSlackMessageHelper, 'updateMessage').mockReturnValue({});
      await ScheduleTripInputHandlers.confirmDestination(destinationPayload, responder);
      expect(InteractivePrompts.sendScheduleTripResponse)
        .toHaveBeenCalled();
      expect(UpdateSlackMessageHelper.updateMessage).toBeCalledTimes(1);
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
    let destinationPayload;
    const tripDetails = createTripData();
    beforeEach(() => {
      destinationPayload = createDestinationPayload('dummyData');
      jest.spyOn(Cache, 'saveObject');
      jest.spyOn(Cache, 'fetch').mockResolvedValueOnce({
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

  describe('detailsConfirmation - sendScheduleTripResponse', () => {
    let destinationPayload;
    const tripDetails = createTripData();
    beforeEach(() => {
      destinationPayload = createDestinationPayload('dummyData');
      jest.spyOn(Cache, 'saveObject');
      jest.spyOn(Cache, 'fetch').mockResolvedValueOnce({
        id: '1',
        department: {
          value: 'dummy'
        },
        tripDetails: {}
      });
      ScheduleTripController.validateTripDetailsForm = jest.fn(() => []);
      jest.spyOn(UserInputValidator, 'getScheduleTripDetails').mockReturnValue(tripDetails);
    });
    it('should respond with preview summary of trip details - detailsConfirmation', async () => {
      const data = {
        submission: {
          Pickup_location: 'Qwetu'
        }
      };
      jest.spyOn(Cache, 'fetch').mockResolvedValueOnce(data);
      await ScheduleTripInputHandlers.detailsConfirmation(destinationPayload, responder);
      expect(InteractivePrompts.sendScheduleTripResponse).toHaveBeenCalled();
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
  describe('test LocationNotFound', () => {
    DialogPrompts.sendLocationDialogToUser = jest.fn();
    it('should send a dialog with the payload when called', async () => {
      await ScheduleTripInputHandlers.locationNotFound(payload, responder);
      expect(DialogPrompts.sendLocationDialogToUser).toHaveBeenCalledWith(payload);
    });
  });

  describe('test resubmitLocation', () => {
    let tripData;
    let cacheSpy;
    beforeEach(() => {
      bugsnagHelper.log = jest.fn();
      cacheSpy = jest.spyOn(Cache, 'fetch');
      jest.spyOn(InteractivePrompts, 'sendScheduleTripResponse');
      jest.spyOn(InteractivePrompts, 'sendSelectDestination');
    });

    it('sends prompt to select destination', async () => {
      tripData = {
        id: 1,
        department: 'TDD',
        pickup: 'RidgeLands'
      };
      cacheSpy.mockResolvedValueOnce(tripData);
      await ScheduleTripInputHandlers.resubmitLocation(payload, responder);
      expect(InteractivePrompts.sendSelectDestination).toHaveBeenCalledWith(responder);
      expect(InteractivePrompts.sendScheduleTripResponse).not.toHaveBeenCalled();
    });

    it('calls schedule trip response after confirming location', async () => {
      tripData = {
        forSelf: 'true', id: 1, department: 'TDD', destination: 'RidgeLands', name: 'akssa'
      };
      const trip = { submission: { Pickup_location: 'Kisiagi' } };
      cacheSpy.mockResolvedValueOnce(tripData);
      cacheSpy.mockResolvedValueOnce(trip);
      await ScheduleTripInputHandlers.resubmitLocation(payload, responder);
      expect(InteractivePrompts.sendScheduleTripResponse).toHaveBeenCalledWith(tripData, responder);
    });

    it('logs errors', async () => {
      cacheSpy.mockRejectedValueOnce('an error');
      await ScheduleTripInputHandlers.resubmitLocation(payload, responder);
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(responder).toHaveBeenCalled();
    });
  });
});
