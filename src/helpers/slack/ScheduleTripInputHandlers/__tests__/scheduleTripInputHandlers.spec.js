import ScheduleTripInputHandlers from '../index';
import InteractivePrompts from '../../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../modules/slack/SlackPrompts/DialogPrompts';
import ScheduleTripController
  from '../../../../modules/slack/TripManagement/ScheduleTripController';
import {
  responseMessage, createPayload, respondMock
} from '../../../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';
import Cache from '../../../../cache';

describe('ScheduleTripInputHandlers Tests', () => {
  const payload = createPayload('dummyValue');
  let responder;

  beforeAll(() => {
    responder = respondMock();
    Cache.fetch = jest.fn(() => ({ forSelf: 'true' }));
    Cache.save = jest.fn();
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
    it('should respond with list of departments', () => {
      ScheduleTripInputHandlers.reason(payload, responder);
      expect(InteractivePrompts.sendAddPassengersResponse)
        .toHaveBeenCalledWith(responder);
    });

    it('should respond with list of users', () => {
      Cache.fetch = jest.fn(() => ({ forSelf: 'false' }));

      ScheduleTripInputHandlers.reason(payload, responder, 'reason');
      expect(InteractivePrompts.sendRiderSelectList)
        .toHaveBeenCalledWith(payload, responder);
    });
  });

  describe('Response to "rider" interaction', () => {
    it('should respond with list of departments', () => {
      ScheduleTripInputHandlers.rider(payload, responder, 'rider');
      expect(InteractivePrompts.sendAddPassengersResponse)
        .toHaveBeenCalledWith(responder, false);
    });
  });

  describe('Response to "addPassengers" interaction', () => {
    it('should respond with message to add passengers', () => {
      Cache.fetch = jest.fn(() => ({ forSelf: 'false' }));
      ScheduleTripInputHandlers.addPassengers(payload, responder);
      expect(InteractivePrompts.sendListOfDepartments)
        .toHaveBeenCalledWith(payload, responder, 'false');
    });
  });

  describe('Response to "department" interaction', () => {
    it('should respond with trip details dialog form', () => {
      ScheduleTripInputHandlers.department(payload, responder, 'department');
      expect(responder).toHaveBeenCalledWith(responseMessage('Loading...'));
      expect(DialogPrompts.sendTripDetailsForm)
        .toHaveBeenCalledWith(payload);
    });
  });

  describe('Response to "locationTime" dialog', () => {
    it('should return errors if they exist', async () => {
      ScheduleTripController.validateTripDetailsForm = jest
        .fn(() => [{ label: 'label', name: 'name' }]);
      const errors = await ScheduleTripInputHandlers.locationTime(payload, responder);
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
