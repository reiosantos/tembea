import { createDepartmentPayloadObject } from '../index';
import InteractivePrompts from '../../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../modules/slack/SlackPrompts/DialogPrompts';
import ScheduleTripController
  from '../../../../modules/slack/TripManagement/ScheduleTripController';
import {
  createTripPayload, respondMock,
} from '../../../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';
import Cache from '../../../../cache';
import Validators from '../../UserInputValidator/Validators';
import LocationHelpers from '../../../googleMaps/locationsMapHelpers';
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
});
