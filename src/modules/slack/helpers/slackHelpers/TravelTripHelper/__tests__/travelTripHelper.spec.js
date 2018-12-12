import travelTripHelper from '../index';
import cache from '../../../../../../cache';
import ScheduleTripController from '../../../../TripManagement/ScheduleTripController';
import InteractivePrompts from '../../../../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../../SlackPrompts/DialogPrompts';

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
          contactDetails: ''
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

    it('department handler should call sendTripDetailsForm with functionName, "travelTripFlightDetailsForm" and callbackId, "travel_trip_flightDetails" when tripType is Airport Transfer', async () => {
      payload.user.id = 1;
      const sendTripDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripDetailsForm');
      sendTripDetailsForm.mockImplementationOnce(() => {});

      travelTripHelper.department(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(2);
      expect(cache.save.mock.calls).toEqual([[1, 'departmentId', ''], [1, 'departmentName', '']]);

      expect(sendTripDetailsForm).toHaveBeenCalledWith(payload, 'travelTripFlightDetailsForm', 'travel_trip_flightDetails');
    });

    it('department handler should call sendTripDetailsForm with functionName, "travelEmbassyDetailsForm" and callbackId, "travel_trip_embassyForm" when tripType is Embassy Visit', async () => {
      payload.user.id = 2;
      const sendTripDetailsForm = jest.spyOn(DialogPrompts,
        'sendTripDetailsForm');
      sendTripDetailsForm.mockImplementationOnce(() => {});

      travelTripHelper.department(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(2);
      expect(cache.save.mock.calls).toEqual([[2, 'departmentId', ''], [2, 'departmentName', '']]);

      expect(sendTripDetailsForm).toHaveBeenCalledWith(payload, 'travelEmbassyDetailsForm', 'travel_trip_embassyForm');
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

    it('should save tripDetails in cache and sendPreviewTripRespons', async () => {
      payload.user.id = 1;
      const validateTravelContactDetailsForm = jest.spyOn(ScheduleTripController,
        'validateTravelDetailsForm');
      validateTravelContactDetailsForm.mockImplementationOnce(() => []);

      const sendPreviewTripResponse = jest.spyOn(InteractivePrompts,
        'sendPreviewTripResponse');
      sendPreviewTripResponse.mockImplementationOnce(() => []);

      await travelTripHelper.flightDetails(payload, respond);

      expect(cache.save).toHaveBeenCalledTimes(1);

      expect(validateTravelContactDetailsForm).toHaveBeenCalledTimes(1);
      expect(sendPreviewTripResponse).toHaveBeenCalledTimes(1);
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
  describe('confirmation', () => {
    let respond;

    beforeEach(() => {
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
      const createTravelTripRequest = jest.spyOn(ScheduleTripController,
        'createTravelTripRequest');
      createTravelTripRequest.mockImplementationOnce(() => []);
      await travelTripHelper.confirmation(payload, respond);
      expect(cache.fetch).toHaveBeenCalledTimes(1);
      expect(createTravelTripRequest).toHaveBeenCalled();
    });
  });
});
