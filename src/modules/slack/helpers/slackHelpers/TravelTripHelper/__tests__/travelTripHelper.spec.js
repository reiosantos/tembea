import TravelTripHelper from '../index';
import cache from '../../../../../../cache';
import ScheduleTripController from '../../../../TripManagement/ScheduleTripController';
import InteractivePrompts from '../../../../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../SlackPrompts/DialogPrompts';
import SlackEvents from '../../../../events';
import BugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import Services from '../../../../../../services/UserService';
import LocationHelpers from '../../../../../../helpers/googleMaps/locationsMapHelpers';
import LocationPrompts from '../../../../SlackPrompts/LocationPrompts';
import Validators from '../../../../../../helpers/slack/UserInputValidator/Validators';
import InteractivePromptSlackHelper from '../../InteractivePromptSlackHelper';
import travelHelper from '../travelHelper';
import UpdateSlackMessageHelper from '../../../../../../helpers/slack/updatePastMessageHelper';

jest.mock('../../../../events', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));
jest.mock('../../../../events/slackEvents', () => ({
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

describe('TravelTripHelper', () => {
  let payload;

  beforeEach(() => {
    cache.save = jest.fn(() => {});
    cache.fetch = jest.fn((id) => {
      if (id === 'TRAVEL_REQUEST_1') {
        return {
          tripType: 'Airport Transfer',
          departmentId: '',
          departmentName: '',
          contactDetails: '',
          tripDetails: {
            destination: 'home',
            pickup: 'dojo',
            tripNote: 'Hello'
          }
        };
      }
      return {};
    });
    payload = {
      user: { id: 1 },
      submission: { tripNote: 'hello' },
      actions: [{ name: '', value: '' }],
      team: { id: 'TEAMID1' }
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('contactDetails', () => {
    let respond;
    beforeEach(() => {
      respond = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should test contact details handler', async () => {
      const validateTravelContactDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelContactDetailsForm');
      validateTravelContactDetailsForm.mockImplementationOnce(() => []);

      const sendListOfDepartments = jest.spyOn(InteractivePrompts,
        'sendListOfDepartments');
      sendListOfDepartments.mockImplementationOnce(() => {});


      await TravelTripHelper.contactDetails(payload, respond);

      expect(validateTravelContactDetailsForm).toHaveBeenCalledTimes(1);
      expect(sendListOfDepartments).toHaveBeenCalledTimes(1);
    });

    it('should test validateTravelContactDetailsForm and catches error ', async () => {
      const validateTravelContactDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelContactDetailsForm');
      validateTravelContactDetailsForm.mockImplementationOnce(() => ([{}]));

      const sendListOfDepartments = jest.spyOn(InteractivePrompts,
        'sendListOfDepartments');
      sendListOfDepartments.mockImplementationOnce(() => {});

      await TravelTripHelper.contactDetails(payload, respond);

      expect(validateTravelContactDetailsForm).toHaveBeenCalledTimes(1);
      expect(sendListOfDepartments).not.toHaveBeenCalled();
    });

    it('should call respond error ', async () => {
      const validateTravelContactDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelContactDetailsForm');
      validateTravelContactDetailsForm.mockImplementationOnce(() => Promise.reject(new Error()));

      const sendListOfDepartments = jest.spyOn(InteractivePrompts,
        'sendListOfDepartments');
      sendListOfDepartments.mockImplementationOnce(() => {});

      await TravelTripHelper.contactDetails(payload, respond);

      expect(validateTravelContactDetailsForm).toHaveBeenCalledTimes(1);
      expect(sendListOfDepartments).not.toHaveBeenCalled();
      expect(respond).toHaveBeenCalledTimes(1);
    });
  });

  describe('department', () => {
    let respond;

    beforeEach(() => {
      respond = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('department handler should call sendTripDetailsForm with functionName,'
      + ' "travelTripFlightDetailsForm" and callbackId, "travel_trip_flightDetails"'
      + ' when tripType is Airport Transfer', async () => {
      payload.user.id = 1;
      const sendTripDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripDetailsForm');
      await sendTripDetailsForm.mockImplementationOnce(() => {});

      await TravelTripHelper.department(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(2);
      expect(cache.save.mock.calls).toEqual(
        [['TRAVEL_REQUEST_1', 'departmentId', ''], ['TRAVEL_REQUEST_1', 'departmentName', '']]
      );

      expect(sendTripDetailsForm).toHaveBeenCalledWith(
        payload, 'travelTripFlightDetailsForm', 'travel_trip_flightDetails'
      );
    });

    it('department handler should call sendTripDetailsForm with functionName,'
      + ' "travelEmbassyDetailsForm" and callbackId, "travel_trip_embassyForm"'
      + ' when tripType is Embassy Visit', async () => {
      payload.user.id = 2;
      const sendTripDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripDetailsForm');
      await sendTripDetailsForm.mockImplementationOnce(() => {});

      await TravelTripHelper.department(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(2);
      expect(cache.save.mock.calls).toEqual(
        [['TRAVEL_REQUEST_2', 'departmentId', ''], ['TRAVEL_REQUEST_2', 'departmentName', '']]
      );

      expect(sendTripDetailsForm).toHaveBeenCalledWith(
        payload, 'travelEmbassyDetailsForm', 'travel_trip_embassyForm'
      );
    });

    it('should handle errors', async () => {
      payload.user.id = 2;
      const log = jest.spyOn(BugsnagHelper, 'log');
      const sendTripDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripDetailsForm');
      sendTripDetailsForm.mockImplementationOnce(() => {
        throw new Error();
      });
      await TravelTripHelper.department(payload, respond);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('embassyForm', () => {
    let respond;

    beforeEach(() => {
      respond = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should save tripDetails in cache and sendPreviewTripRespons', async () => {
      payload.user.id = 1;
      const validateTravelContactDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelContactDetailsForm.mockImplementationOnce(() => []);

      const sendPreviewTripResponse = jest.spyOn(InteractivePrompts,
        'sendPreviewTripResponse');
      sendPreviewTripResponse.mockImplementationOnce(() => []);

      await TravelTripHelper.embassyForm(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(1);

      expect(validateTravelContactDetailsForm).toHaveBeenCalledTimes(1);
      expect(sendPreviewTripResponse).toHaveBeenCalledTimes(1);
    });

    it('should catch error ', async () => {
      payload.user.id = 2;
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelDetailsForm.mockImplementationOnce(() => [{}]);

      const result = await TravelTripHelper.embassyForm(payload, respond);

      expect(result).toEqual({ errors: [{}] });
      expect(validateTravelDetailsForm).toHaveBeenCalledTimes(1);
    });

    it('should call respond error', async () => {
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelDetailsForm.mockImplementationOnce(() => Promise.reject(new Error()));

      const sendPreviewTripResponse = jest.spyOn(InteractivePrompts,
        'sendPreviewTripResponse');
      sendPreviewTripResponse.mockImplementationOnce(() => {});

      await TravelTripHelper.embassyForm(payload, respond);

      expect(validateTravelDetailsForm).toHaveBeenCalledTimes(1);
      expect(sendPreviewTripResponse).not.toHaveBeenCalled();
      expect(respond).toHaveBeenCalledTimes(1);
    });
  });

  describe('flightDetails', () => {
    let respond;
    beforeEach(() => {
      respond = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should save tripDetails in cache', async () => {
      payload.user.id = 1;
      const validateTravelContactDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelContactDetailsForm.mockImplementationOnce(() => []);

      await TravelTripHelper.flightDetails(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(1);
      expect(validateTravelContactDetailsForm).toHaveBeenCalledTimes(1);
    });

    it('should catch error ', async () => {
      payload.user.id = 2;
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelDetailsForm.mockImplementationOnce(() => [{}]);

      const result = await TravelTripHelper.flightDetails(payload, respond);

      expect(result).toEqual({ errors: [{}] });
      expect(validateTravelDetailsForm).toHaveBeenCalledTimes(1);
    });

    it('should call respond error', async () => {
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelDetailsForm.mockImplementationOnce(() => Promise.reject(new Error()));

      const sendPreviewTripResponse = jest.spyOn(InteractivePrompts,
        'sendPreviewTripResponse');
      sendPreviewTripResponse.mockImplementationOnce(() => {});

      await TravelTripHelper.flightDetails(payload, respond);

      expect(validateTravelDetailsForm).toHaveBeenCalledTimes(1);
      expect(sendPreviewTripResponse).not.toHaveBeenCalled();
      expect(respond).toHaveBeenCalledTimes(1);
    });
  });

  describe('Location not found', () => {
    let respond;

    const passedData = {
      actions: [{ name: 'no' }],
    };

    beforeEach(() => {
      respond = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call the respond method', () => {
      travelHelper.locationNotFound(passedData, respond);
      expect(respond).toHaveBeenCalled();
    });
  });

  describe('Locations suggestions', () => {
    let respond;

    const passedData = {
      actions: [{ name: 'no' }],
    };

    const loadData = {
      actions: [{ name: 'yes' }],
    };

    beforeEach(() => {
      respond = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call the location suggestion function', async () => {
      const locationSuggestions = jest.spyOn(LocationHelpers, 'locationSuggestions');
      const errorPromptMessage = jest.spyOn(LocationPrompts, 'errorPromptMessage');

      await TravelTripHelper.suggestions(passedData, respond);
      expect(errorPromptMessage).toHaveBeenCalled();

      await TravelTripHelper.suggestions(loadData, respond);
      expect(locationSuggestions).toHaveBeenCalled();
    });
  });

  describe('destinationSelection', () => {
    let respond;
    let sendTripDetailsForm;

    beforeEach(() => {
      respond = jest.fn();
      sendTripDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripDetailsForm').mockResolvedValue({});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('Call respond on Airport Transfer', async () => {
      await TravelTripHelper.destinationSelection(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(cache.fetch).toHaveBeenCalledWith('TRAVEL_REQUEST_1');
      expect(respond).toHaveBeenCalled();
      expect(sendTripDetailsForm).toHaveBeenCalled();
    });

    it('Call respond on value = cancel', async () => {
      const dataload = {
        user: { id: 1 }, submission: {}, actions: [{ name: '', value: 'cancel' }]
      };
      await TravelTripHelper.destinationSelection(dataload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(0);
      expect(respond).toHaveBeenCalled();
      expect(sendTripDetailsForm).toHaveBeenCalledTimes(0);
    });

    it('Should call respond if tripType is not airport transfer', async () => {
      cache.fetch = jest.fn().mockReturnValue({
        tripType: 'Not Airport Transfer',
        departmentId: '',
        departmentName: '',
        contactDetails: '',
        tripDetails: {
          destination: 'home',
          pickup: 'dojo'
        }
      });
      await TravelTripHelper.destinationSelection(payload, respond);
      expect(respond).toHaveBeenCalled();
    });

    it('Should capture errors', async () => {
      cache.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Dummy error');
      });
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      await TravelTripHelper.destinationSelection(payload, respond);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });
  });

  describe('destinationConfirmation', () => {
    let respond;
    const dataload = {
      user: {
        id: 1
      },
      submission: {
        destination: 'Nairobi',
        othersDestination: ''
      }
    };
    beforeEach(() => {
      respond = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('Should call validate details form', async () => {
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      await TravelTripHelper.destinationConfirmation(dataload, respond);
      expect(validateTravelDetailsForm).toHaveBeenCalled();
      expect(cache.fetch).toHaveBeenCalled();
    });

    it('Should capture errors', async () => {
      cache.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Dummy error');
      });
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      await TravelTripHelper.destinationConfirmation(dataload, respond);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });

    it('Should resolve with an error', async () => {
      const error = ['error', 'error'];
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelDetailsForm.mockResolvedValue(error);
      const valueIs = await TravelTripHelper.destinationConfirmation(dataload, respond);
      expect(valueIs).toEqual({ errors: error });
    });
  });

  describe('confirmation', () => {
    let respond;
    let createTravelTripRequest;

    beforeEach(() => {
      createTravelTripRequest = jest.spyOn(ScheduleTripController,
        'createTravelTripRequest');
      respond = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should test cancel confirmation', async () => {
      payload.actions[0].value = 'cancel';

      const sendCancelRequestResponse = jest.spyOn(InteractivePromptSlackHelper,
        'sendCancelRequestResponse');
      await TravelTripHelper.confirmation(payload, respond);
      expect(sendCancelRequestResponse).toHaveBeenCalledWith(respond);
    });

    it('should test confirmation ', async () => {
      payload.user.id = 1;
      payload.actions[0].value = 'confirm';
      InteractivePromptSlackHelper.sendCompletionResponse = jest.fn();
      SlackEvents.raise = jest.fn();
      jest.spyOn(TravelTripHelper, 'processTripCompletion');
      createTravelTripRequest.mockImplementationOnce(() => ({ newPayload: 'newPayload', id: 1 }));

      await TravelTripHelper.confirmation(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(TravelTripHelper.processTripCompletion).toHaveBeenCalled();
      expect(createTravelTripRequest).toHaveBeenCalled();
      expect(InteractivePromptSlackHelper.sendCompletionResponse).toHaveBeenCalled();
      expect(SlackEvents.raise).toHaveBeenCalled();
    });

    it('should test confirmation when "To Be Decided" is passed', async () => {
      payload.user.id = 1;
      payload.actions[0].value = 'confirm';
      cache.fetch = jest.fn((id) => {
        if (id === 'TRAVEL_REQUEST_1') {
          return {
            tripType: 'Airport Transfer',
            departmentId: '',
            departmentName: '',
            contactDetails: '',
            tripDetails: {
              pickup: 'To Be Decided',
              destination: 'Langata',
              rider: 'QW345UY'
            }
          };
        }
        return {};
      });

      const validatePickupDestination = jest.spyOn(travelHelper,
        'validatePickupDestination').mockImplementation(() => Promise.resolve());
      createTravelTripRequest.mockImplementationOnce(() => ({ newPayload: 'newPayload', id: 1 }));

      await TravelTripHelper.confirmation(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(cache.save).toHaveBeenCalledTimes(1);
      expect(validatePickupDestination).toHaveBeenCalledWith(
        {
          pickup: 'To Be Decided',
          destination: 'Langata',
          teamID: 'TEAMID1',
          userID: 1,
          rider: 'QW345UY'
        }, respond
      );
    });

    it('should test confirmation error handling', async () => {
      payload.user.id = 1;
      payload.actions[0].value = 'confirm';
      const log = jest.spyOn(BugsnagHelper, 'log');
      InteractivePromptSlackHelper.sendCompletionResponse = jest.fn();
      SlackEvents.raise = jest.fn();

      createTravelTripRequest.mockRejectedValue(new Error());

      await TravelTripHelper.confirmation(payload, respond);
      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('detailsConfirmation', () => {
    let respond;

    beforeEach(() => {
      respond = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should sendPreviewTripResponse to the user', async () => {
      const slackReturn = { dataValues: { name: 'I am' } };
      const getUserBySlackId = jest.spyOn(Services,
        'getUserBySlackId').mockResolvedValue(slackReturn);

      const sendPreviewTripResponse = jest.spyOn(InteractivePrompts,
        'sendPreviewTripResponse');

      await travelHelper.detailsConfirmation(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(getUserBySlackId).toHaveBeenCalledTimes(1);
      expect(sendPreviewTripResponse).toHaveBeenCalledTimes(1);
    });


    it('Should capture errors', async () => {
      cache.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Dummy error');
      });
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      await travelHelper.detailsConfirmation(payload, respond);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });
  });

  describe('tripNotesAddition', () => {
    let respond;

    beforeEach(() => {
      respond = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should sendPreviewTripResponse to the user when input tripNotes', async () => {
      const sendPreviewTripResponse = jest.spyOn(InteractivePrompts,
        'sendPreviewTripResponse');

      await TravelTripHelper.tripNotesAddition(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(sendPreviewTripResponse).toHaveBeenCalledTimes(1);
    });

    it('should sendPreviewTripResponse to the user when input tripNotes has been updated',
      async () => {
        const sendPreviewTripResponse = jest.spyOn(InteractivePrompts,
          'sendPreviewTripResponse');

        await travelHelper.tripNotesUpdate(payload, respond);
        expect(cache.fetch).toHaveBeenCalledTimes(1);
        expect(sendPreviewTripResponse).toHaveBeenCalledTimes(1);
      });

    it('should update the message when the payload contains a state', async () => {
      payload.state = {};

      jest.spyOn(UpdateSlackMessageHelper, 'updateMessage');
      await TravelTripHelper.tripNotesAddition(payload, respond);
      expect(UpdateSlackMessageHelper.updateMessage).toBeCalled();
    });

    it('should update the message when the payload contains a state and a tripNote', async () => {
      payload.state = {};

      jest.spyOn(UpdateSlackMessageHelper, 'updateMessage');
      await travelHelper.tripNotesUpdate(payload, respond);
      expect(UpdateSlackMessageHelper.updateMessage).toBeCalled();
    });

    it('should send send tripNoteDialogForm ', async () => {
      payload.actions[0].value = 'trip_note';

      DialogPrompts.sendTripNotesDialogForm = jest.fn;

      const sendTripNoteDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripNotesDialogForm');
      await sendTripNoteDetailsForm.mockImplementationOnce(() => {});
      await travelHelper.checkNoteStatus(payload, respond);
      await TravelTripHelper.confirmation(payload, respond);

      expect(cache.fetch).toBeCalled();
      expect(DialogPrompts.sendTripNotesDialogForm).toBeCalled();
    });

    it('should call respond if there is tripNote value in cache', async () => {
      const cacheReturn = { tripDetails: { tripNote: 'A note' } };

      jest.spyOn(cache,
        'fetch').mockResolvedValue(cacheReturn);

      payload.actions[0].value = 'trip_note';
      DialogPrompts.sendTripNotesDialogForm = jest.fn;
      const sendTripNoteDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripNotesDialogForm');
      jest.spyOn(travelHelper, 'checkNoteStatus');
      await sendTripNoteDetailsForm.mockImplementationOnce(() => {});
      await TravelTripHelper.confirmation(payload, respond);

      expect(travelHelper.checkNoteStatus).toBeCalled();
      expect(DialogPrompts.sendTripNotesDialogForm).toBeCalled();
    });
  
    it('should call respond if there is tripNote value in cache to update a trip', async () => {
      const cacheReturn = { tripDetails: { tripNote: 'A note' } };

      jest.spyOn(cache,
        'fetch').mockResolvedValue(cacheReturn);

      payload.actions[0].value = 'update_note';

      DialogPrompts.sendTripNotesDialogForm = jest.fn;
      const sendTripNoteDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripNotesDialogForm');
      jest.spyOn(travelHelper, 'checkNoteStatus');

      await sendTripNoteDetailsForm.mockImplementationOnce(() => {});
      await TravelTripHelper.confirmation(payload, respond);
      expect(travelHelper.checkNoteStatus).toBeCalled();
      expect(DialogPrompts.sendTripNotesDialogForm).toBeCalled();
    });

    it('should throw validation errors in empty values in submission', async () => {
      const payload1 = { submission: '     ', actions: [{ value: '' }], user: { id: 1 } };

      Validators.validateDialogSubmission = jest.fn(() => []);

      jest.spyOn(Validators, 'validateDialogSubmission')
        .mockReturnValue(['errors']);

      const errors = await TravelTripHelper.tripNotesAddition(payload1, respond);

      expect(Validators.validateDialogSubmission).toBeCalled();
      expect(errors.errors).toEqual(['errors']);
    });
  });

  describe('sendCompletedResponseToOps', () => {
    let respond;

    beforeEach(() => {
      respond = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should send completed trip details to Ops', async () => {
      const tripRequest = jest.fn;
      const tripData = jest.fn;
      const sendCompletionResponseSpy = jest.spyOn(
        InteractivePromptSlackHelper, 'sendCompletionResponse'
      ).mockImplementation(() => Promise.resolve());
      SlackEvents.raise = jest.fn();

      await TravelTripHelper.sendCompletedResponseToOps(tripRequest, tripData, respond, payload);
      expect(sendCompletionResponseSpy).toHaveBeenCalledTimes(1);
      expect(SlackEvents.raise).toHaveBeenCalledTimes(1);
    });
  });
});
