import ScheduleTripInputHandlers from '../index';
import InteractivePrompts from '../../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../modules/slack/SlackPrompts/DialogPrompts';
import ScheduleTripController
  from '../../../../modules/slack/TripManagement/ScheduleTripController';
import {
  responseMessage, createPayload, respondMock,
  createDestinationPayload, createPickupPayload
} from '../../../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';
import Cache from '../../../../cache';

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
  const payload = createPayload('dummyValue');
  let responder;

  beforeAll(() => {
    responder = respondMock();
    Cache.fetch = jest.fn(() => ({ forSelf: 'true' }));
    Cache.save = jest.fn();
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
      await ScheduleTripInputHandlers.reason(payload, responder, 'reason');
      expect(InteractivePrompts.sendRiderSelectList)
        .toHaveBeenCalledWith(payload, responder);
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
  });

  describe('Response to "department" interaction', () => {
    it('should respond with trip details dialog form', async () => {
      await ScheduleTripInputHandlers.department(payload, responder, 'department');
      expect(responder).toHaveBeenCalledWith(responseMessage('Noted...'));
      expect(DialogPrompts.sendTripDetailsForm)
        .toHaveBeenCalledWith(payload, 'regularTripForm',
          'schedule_trip_tripDestination', 'Pickup Details');
    });
  });

  describe('Response to "tripDestination" interaction', () => {
    const pickupPayload = createPickupPayload('dummyData');
    it('should respond with pickup details dialog form', async () => {
      jest.spyOn(Cache, 'save');
      jest.spyOn(ScheduleTripController, 'validateTripDetailsForm').mockResolvedValue([]);
      const result = jest.spyOn(InteractivePrompts, 'sendSelectDestination');
      await ScheduleTripInputHandlers.tripDestination(pickupPayload, responder);
      expect(result)
        .toHaveBeenCalled();
    });
  });

  describe('Response to "tripDestination" dialog', () => {
    const pickupPayload = createPickupPayload('dummyData');
    it('should return errors if they exist', async () => {
      ScheduleTripController.validateTripDetailsForm = jest
        .fn(() => [{ label: 'label', name: 'name' }]);
      const errors = await ScheduleTripInputHandlers.tripDestination(pickupPayload, responder);
      expect(errors.errors).toEqual([{ label: 'label', name: 'name' }]);
    });
    it('should send a fail response when an error occurs', async () => {
      jest.spyOn(InteractivePrompts, 'sendSelectDestination').mockRejectedValue(new Error('Error'));
      await ScheduleTripInputHandlers.tripDestination(pickupPayload, responder);
      expect(responder).toHaveBeenCalled();
    });
  });

  describe('Response to "selectDestination" interaction', () => {
    const pickupPayload = createPickupPayload('dummyData');
    it('should respond with destination details dialog form', async () => {
      await ScheduleTripInputHandlers.selectDestination(pickupPayload, responder);
      expect(DialogPrompts.sendTripDetailsForm)
        .toHaveBeenCalledWith(pickupPayload, 'tripDestinationLocationForm',
          'schedule_trip_locationTime', 'Destination Details');
    });
    it('should send a fail response when an error occurs', async () => {
      DialogPrompts.sendTripDetailsForm.mockImplementation(() => {
        throw new Error();
      });
      await ScheduleTripInputHandlers.selectDestination(pickupPayload, responder);
      expect(responder).toHaveBeenCalledTimes(2);
    });
  });

  describe('Response to "locationTime" dialog', () => {
    const payloadDestination = createDestinationPayload('dummyValue');
    const pickup = createPickupPayload('dummyData');
    beforeEach(() => {
      Cache.fetch = jest.fn(() => pickup.submission);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return errors if they exist', async () => {
      ScheduleTripController.validateTripDetailsForm = jest
        .fn(() => [{ label: 'label', name: 'name' }]);
      const errors = await ScheduleTripInputHandlers.locationTime(payloadDestination, responder);
      expect(errors.errors).toEqual([{ label: 'label', name: 'name' }]);
    });
    it('should send a fail response when an error occurs', async () => {
      ScheduleTripController.createTripRequest.mockImplementation(() => {
        throw new Error();
      });
      ScheduleTripController.validateTripDetailsForm = jest.fn(() => []);
      await ScheduleTripInputHandlers.locationTime(payload, responder);
      expect(responder).toHaveBeenCalledTimes(2);
    });
  });
});
