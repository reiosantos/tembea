import travelTripHelper from '../index';
import cache from '../../../../../../cache';
import ScheduleTripController from '../../../../TripManagement/ScheduleTripController';
import InteractivePrompts from '../../../../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../SlackPrompts/DialogPrompts';
import SlackEvents from '../../../../events';
import BugsnagHelper from '../../../../../../helpers/bugsnagHelper';
import Services from '../../../../../../services/UserService';
import LocationHelpers from '../../../../../../helpers/googleMaps/locationsMapHelpers';
import LocationPrompts from '../../../../SlackPrompts/LocationPrompts';

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


describe('travelTripHelper', () => {
  let payload;

  beforeEach(() => {
    cache.save = jest.fn(() => {});
    cache.fetch = jest.fn((id) => {
      if (id === 1) {
        return {
          tripType: 'Airport Transfer',
          departmentId: '',
          departmentName: '',
          contactDetails: '',
          tripDetails: {
            destination: 'home',
            pickup: 'dojo'
          }
        };
      }
      return {};
    });
    payload = { user: { id: 1 }, submission: {}, actions: [{ name: '', value: '' }] };
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


      await travelTripHelper.contactDetails(payload, respond);

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

      await travelTripHelper.contactDetails(payload, respond);

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

      await travelTripHelper.contactDetails(payload, respond);

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

      await travelTripHelper.department(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(2);
      expect(cache.save.mock.calls).toEqual([[1, 'departmentId', ''], [1, 'departmentName', '']]);

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

      await travelTripHelper.department(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(2);
      expect(cache.save.mock.calls).toEqual([[2, 'departmentId', ''], [2, 'departmentName', '']]);

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
      await travelTripHelper.department(payload, respond);
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

      await travelTripHelper.embassyForm(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(1);

      expect(validateTravelContactDetailsForm).toHaveBeenCalledTimes(1);
      expect(sendPreviewTripResponse).toHaveBeenCalledTimes(1);
    });

    it('should catch error ', async () => {
      payload.user.id = 2;
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelDetailsForm.mockImplementationOnce(() => [{}]);

      const result = await travelTripHelper.embassyForm(payload, respond);

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

      await travelTripHelper.embassyForm(payload, respond);

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
      
      await travelTripHelper.flightDetails(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(1);
      expect(validateTravelContactDetailsForm).toHaveBeenCalledTimes(1);
    });

    it('should catch error ', async () => {
      payload.user.id = 2;
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelDetailsForm.mockImplementationOnce(() => [{}]);

      const result = await travelTripHelper.flightDetails(payload, respond);

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

      await travelTripHelper.flightDetails(payload, respond);

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
      travelTripHelper.locationNotFound(passedData, respond);
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
      
      await travelTripHelper.suggestions(passedData, respond);
      expect(errorPromptMessage).toHaveBeenCalled();
      
      await travelTripHelper.suggestions(loadData, respond);
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
      await travelTripHelper.destinationSelection(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(cache.fetch).toHaveBeenCalledWith(1);
      expect(respond).toHaveBeenCalled();
      expect(sendTripDetailsForm).toHaveBeenCalled();
    });

    it('Call respond on value = cancel', async () => {
      const dataload = {
        user: { id: 1 }, submission: {}, actions: [{ name: '', value: 'cancel' }]
      };
      await travelTripHelper.destinationSelection(dataload, respond);
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
      await travelTripHelper.destinationSelection(payload, respond);
      expect(respond).toHaveBeenCalled();
    });

    it('Should capture errors', async () => {
      cache.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Dummy error');
      });
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      await travelTripHelper.destinationSelection(payload, respond);
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
      await travelTripHelper.destinationConfirmation(dataload, respond);
      expect(validateTravelDetailsForm).toHaveBeenCalled();
      expect(cache.fetch).toHaveBeenCalled();
    });

    it('Should capture errors', async () => {
      cache.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Dummy error');
      });
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      await travelTripHelper.destinationConfirmation(dataload, respond);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });

    it('Should resolve with an error', async () => {
      const error = ['error', 'error'];
      const validateTravelDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelDetailsForm.mockResolvedValue(error);
      const valueIs = await travelTripHelper.destinationConfirmation(dataload, respond);
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

      const sendCancelRequestResponse = jest.spyOn(InteractivePrompts,
        'sendCancelRequestResponse');
      await travelTripHelper.confirmation(payload, respond);
      expect(sendCancelRequestResponse).toHaveBeenCalledWith(respond);
    });

    it('should test confirmation ', async () => {
      payload.user.id = 1;
      InteractivePrompts.sendCompletionResponse = jest.fn();
      SlackEvents.raise = jest.fn();

      createTravelTripRequest.mockImplementationOnce(() => ({ newPayload: 'newPayload', id: 1 }));

      await travelTripHelper.confirmation(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(createTravelTripRequest).toHaveBeenCalled();
      expect(InteractivePrompts.sendCompletionResponse).toHaveBeenCalled();
      expect(SlackEvents.raise).toHaveBeenCalled();
    });

    it('should test confirmation error handling', async () => {
      payload.user.id = 1;
      const log = jest.spyOn(BugsnagHelper, 'log');
      InteractivePrompts.sendCompletionResponse = jest.fn();
      SlackEvents.raise = jest.fn();

      createTravelTripRequest.mockRejectedValue(new Error());

      await travelTripHelper.confirmation(payload, respond);
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

      await travelTripHelper.detailsConfirmation(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(getUserBySlackId).toHaveBeenCalledTimes(1);
      expect(sendPreviewTripResponse).toHaveBeenCalledTimes(1);
    });


    it('Should capture errors', async () => {
      cache.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Dummy error');
      });
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      await travelTripHelper.detailsConfirmation(payload, respond);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });
  });
});
