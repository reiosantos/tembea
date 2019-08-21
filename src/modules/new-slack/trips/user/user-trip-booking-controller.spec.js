import UserTripBookingController from './user-trip-booking-controller';
import UserTripHelpers from './user-trip-helpers';
import { Cache, SlackInteractiveMessage } from '../../../slack/RouteManagement/rootFile';
import userTripActions from './actions';
import Interactions from './interactions';
import UpdateSlackMessageHelper from '../../../../helpers/slack/updatePastMessageHelper';
import DepartmentService from '../../../../services/DepartmentService';
import SlackController from '../../../slack/SlackController';
import ScheduleTripController from '../../../slack/TripManagement/ScheduleTripController';
import Validators from './validators';
import NewLocationHelpers from '../../helpers/location-helpers';
import UserService from '../../../../services/UserService';
import HomebaseService from '../../../../services/HomebaseService';

describe('UserTripBookingController', () => {
  const [payload, res] = [{
    actions: [{
      action_id: userTripActions.forMe,
    }],
    submission: {
      dateTime: '22/12/2019 10:55',
      pickup: 'Somewhere on Earth'
    },
    user: {
      // tz_offset: 3600,
      id: 'UIS233'
    },
    team: { id: 'UIS233' },
    response_url: 'http://url.com'
  }, jest.fn()];

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(Cache, 'save').mockResolvedValue();
    jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockResolvedValue(1);
  });

  describe('savePickupDetails', () => {
    beforeAll(() => jest.spyOn(Cache, 'saveObject').mockResolvedValue());

    it('should run successfully if payload is valid', async () => {
      jest.spyOn(Validators, 'validatePickUpSubmission').mockResolvedValue(payload.submission);
      jest.spyOn(UserTripHelpers, 'updateTripData').mockResolvedValue(payload);
      await UserTripBookingController.savePickupDetails(payload, res);
      expect(res).toHaveBeenCalledTimes(1);
      expect(Cache.saveObject).toHaveBeenCalled();
    });

    it('should send error message when payload is invalid', async () => {
      const data = { ...payload };
      const error = {
        errors: [{ error: '"othersPickup" is required', name: 'othersPickup' }]
      };
      data.submission.pickup = 'Others';
      jest.spyOn(Validators, 'validatePickUpSubmission')
        .mockResolvedValue(error);
      const pickupDetails = await UserTripBookingController.savePickupDetails(payload, res);
      expect(pickupDetails).toEqual(error);
    });
  });

  describe('startTripBooking', () => {
    it('should send start booking trip message', () => {
      UserTripBookingController.startTripBooking(payload, res);
      expect(res).toHaveBeenCalledTimes(1);
    });
  });

  describe('forMe', () => {
    it('should handle foSomeone', async () => {
      const newPayload = {
        ...payload,
        actions: [{
          action_id: userTripActions.forSomeone,
        }]
      };
      await UserTripBookingController.forMe(newPayload, res);
      expect(Cache.save).toHaveBeenCalled();
    });

    it('should handle forMe', async () => {
      const state = { origin: payload.response_url };
      jest.spyOn(Interactions, 'sendTripReasonForm').mockResolvedValue();
      await UserTripBookingController.forMe(payload, res);
      expect(Interactions.sendTripReasonForm).toHaveBeenCalledWith(payload, state);
    });
  });

  describe('saveRider', () => {
    it('should save a rider', async () => {
      const newPayload = {
        ...payload,
        actions: [{
          ...payload.actions,
          selected_user: 'HJYYU8II'
        }]
      };
      const state = { origin: newPayload.response_url };
      jest.spyOn(Interactions, 'sendTripReasonForm').mockResolvedValue();
      await UserTripBookingController.saveRider(newPayload);
      expect(Cache.save).toHaveBeenCalled();
      expect(Interactions.sendTripReasonForm).toHaveBeenCalledWith(newPayload, state);
    });
  });

  describe('handleReasonSubmit', () => {
    const newPayload = {
      ...payload,
      submission: {
        reason: 'Good reason'
      },
      state: '{ "origin": "https://origin.com"}'
    };
    it('should handle reason dialog submission', async () => {
      jest.spyOn(UpdateSlackMessageHelper, 'newUpdateMessage');
      await UserTripBookingController.handleReasonSubmit(newPayload);
      expect(UpdateSlackMessageHelper.newUpdateMessage).toHaveBeenCalled();
      expect(Cache.save).toHaveBeenCalled();
    });

    it('should throw error when reason submission is empty', async () => {
      newPayload.submission.reason = '';
      const result = await UserTripBookingController.handleReasonSubmit(newPayload);
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.errors[0].error).toBe('"reason" is not allowed to be empty');
    });

    it('should send add passengers message if there is no submission', async () => {
      newPayload.submission = null;
      jest.spyOn(UpdateSlackMessageHelper, 'newUpdateMessage');
      await UserTripBookingController.handleReasonSubmit(newPayload);
      expect(UpdateSlackMessageHelper.newUpdateMessage).toHaveBeenCalled();
    });
  });

  describe('saveExtraPassengers', () => {
    beforeEach(() => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue({ forMe: true });
      jest.spyOn(DepartmentService, 'getDepartmentsForSlack')
        .mockResolvedValue([{ label: 'department', value: 22 }]);
    });
    it('should save extra passengers', async () => {
      const newPayload = {
        ...payload,
        actions: [{
          ...payload.actions,
          selected_option: { value: '2' }
        }]
      };
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue({ homebaseId: 1 });
      await UserTripBookingController.saveExtraPassengers(newPayload, res);
      expect(Cache.save).toHaveBeenCalled();
      expect(res).toHaveBeenCalled();
    });

    it('should not add extra passengers', async () => {
      const newPayload = {
        ...payload,
        actions: [{
          value: '0'
        }]
      };
      jest.spyOn(UserService, 'getUserBySlackId').mockImplementation(() => ({ homebaseId: 1 }));
      await UserTripBookingController.saveExtraPassengers(newPayload, res);
      expect(Cache.save).toHaveBeenCalled();
      expect(res).toHaveBeenCalled();
    });
  });

  describe('saveDepartment', () => {
    it('shoud save department', async () => {
      const newPayload = {
        ...payload,
        actions: [{
          value: 22,
          text: {
            text: 'Finance'
          }
        }]
      };
      jest.spyOn(Interactions, 'sendDetailsForm').mockResolvedValue();
      await UserTripBookingController.saveDepartment(newPayload);
      expect(Cache.save).toHaveBeenCalledTimes(2);
      expect(Interactions.sendDetailsForm).toHaveBeenCalled();
    });
  });

  describe('sendDestination', () => {
    it('should send destination details dialog', async () => {
      jest.spyOn(Interactions, 'sendDetailsForm').mockResolvedValue();
      await UserTripBookingController.sendDestinations(payload);
    });
  });

  describe('saveDestination', () => {
    const newPayload = {
      ...payload,
      submission: {
        destination: 'Nairobi',
        othersDestination: null
      }
    };

    beforeEach(() => {
      jest.spyOn(Interactions, 'sendPostDestinationMessage').mockResolvedValue();
      jest.spyOn(Cache, 'fetch').mockResolvedValue({ pickup: 'kigali', othersPickup: null });
    });

    it('should save destination details', async () => {
      jest.spyOn(Cache, 'saveObject').mockResolvedValue();
      jest.spyOn(NewLocationHelpers, 'getDestinationCoordinates').mockResolvedValue();
      await UserTripBookingController.saveDestination(newPayload);
      expect(Cache.saveObject).toHaveBeenCalled();
      expect(Cache.fetch).toHaveBeenCalled();
    });

    it('should fail to save destination when input is empty', async () => {
      const tPayload = { ...newPayload };
      tPayload.submission.destination = '';
      const result = await UserTripBookingController.saveDestination(tPayload);
      expect(result.errors).toBeDefined();
      expect(result.errors[0].error).toBe('"destination" is not allowed to be empty');
    });

    it('should send post destination message if no submission', async () => {
      newPayload.submission = null;
      await UserTripBookingController.saveDestination(newPayload);
      expect(Interactions.sendPostDestinationMessage).toHaveBeenCalledWith(newPayload);
    });
  });

  describe('updateState', () => {
    it('should update the state', async () => {
      jest.spyOn(UpdateSlackMessageHelper, 'updateMessage').mockResolvedValue();
      await UserTripBookingController.updateState([payload.response_url]);
      expect(UpdateSlackMessageHelper.updateMessage)
        .toHaveBeenCalledWith([payload.response_url], { text: 'Noted' });
    });
  });

  describe('cancel', () => {
    it('should send thank you message after cancel', async () => {
      await UserTripBookingController.cancel(payload, res);
      expect(res).toHaveBeenCalled();
    });
  });

  describe('back', () => {
    let newPayload;
    beforeAll(() => {
      newPayload = {
        ...payload,
        actions: [{
          value: 'back_to_launch'
        }]
      };
    });

    it('should go back to launch', async () => {
      jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockReturnValue(
        { id: 1, name: 'Nairobi' }
      );
      await UserTripBookingController.back(newPayload, res);
      expect(res).toHaveBeenCalledWith(await SlackController.getWelcomeMessage(payload.user.slackId));
    });

    it('should go back to start trip booking message', async () => {
      newPayload.actions[0].value = userTripActions.forMe;
      jest.spyOn(UserTripBookingController, 'startTripBooking').mockReturnValue();
      await UserTripBookingController.back(newPayload, res);
      expect(UserTripBookingController.startTripBooking)
        .toHaveBeenCalledWith(newPayload, res);
    });

    it('should go back to handle reason submission', async () => {
      newPayload.actions[0].value = userTripActions.forSomeone;
      jest.spyOn(UserTripBookingController, 'handleReasonSubmit').mockReturnValue();
      await UserTripBookingController.back(newPayload, res);
      expect(UserTripBookingController.handleReasonSubmit)
        .toHaveBeenCalledWith(newPayload, res);
    });

    it('should go back to add extra passengers', async () => {
      newPayload.actions[0].value = userTripActions.addExtraPassengers;
      await UserTripBookingController.back(newPayload, res);
      expect(res).toHaveBeenCalledWith(UserTripHelpers.getAddPassengersMessage());
    });

    it('should go back to add get department message', async () => {
      newPayload.actions[0].value = userTripActions.getDepartment;
      jest.spyOn(UserTripHelpers, 'getDepartmentListMessage').mockResolvedValue();
      await UserTripBookingController.back(newPayload, res);
      expect(res).toHaveBeenCalled();
    });

    it('should send default value when there is no back value provided', async () => {
      newPayload.actions[0].value = '';
      await UserTripBookingController.back(newPayload, res);
      expect(res).toHaveBeenCalledWith(new SlackInteractiveMessage('Thank you for using Tembea'));
    });
  });

  describe('confirmLocation', () => {
    const newPayload = {
      ...payload,
      actions: [{
        action_id: userTripActions.selectPickupLocation,
        selected_option: {
          text: {
            text: 'Nairobi'
          }
        }
      }]
    };
    beforeEach(() => {
      jest.spyOn(UserTripHelpers, 'handleLocationVerfication')
        .mockResolvedValue('verification message');
      jest.spyOn(UpdateSlackMessageHelper, 'newUpdateMessage').mockResolvedValue();
    });
    it('should confirm pickup location', async () => {
      await UserTripBookingController.confirmLocation(newPayload);
      expect(UpdateSlackMessageHelper.newUpdateMessage).toHaveBeenCalled();
    });

    it('should confirm destination location', async () => {
      newPayload.actions[0].action_id = userTripActions.selectDestinationLocation;
      await UserTripBookingController.confirmLocation(newPayload);
      expect(UpdateSlackMessageHelper.newUpdateMessage).toHaveBeenCalled();
    });
  });

  describe('confirmTripRequest', () => {
    beforeEach(() => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue({});
    });
    it('should confirm trip request', async () => {
      jest.spyOn(ScheduleTripController, 'createTripRequest').mockResolvedValue();
      jest.spyOn(Cache, 'delete').mockResolvedValue();
      await UserTripBookingController.confirmTripRequest(payload, res);
      expect(Cache.fetch).toHaveBeenCalledTimes(1);
      expect(Cache.delete).toHaveBeenCalledTimes(1);
      expect(ScheduleTripController.createTripRequest).toHaveBeenCalled();
    });

    it('should fail when confirming trip request', async () => {
      try {
        jest.spyOn(ScheduleTripController, 'createTripRequest')
          .mockRejectedValue(new Error('Create Request error'));
        await UserTripBookingController.confirmTripRequest(payload, res);
      } catch (error) {
        expect(error).toBeDefined();
        expect(res).toHaveBeenCalled();
      }
    });
  });

  describe('paymentRequest', () => {
    it('save payment request', async () => {
      jest.spyOn(UserTripHelpers, 'savePayment').mockResolvedValue();
      await UserTripBookingController.paymentRequest(payload, res);
      expect(UserTripHelpers.savePayment).toHaveBeenCalled();
    });

    it('should return errors when request fails', async () => {
      jest.spyOn(UserTripHelpers, 'savePayment').mockResolvedValue({ errors: 'error' });
      const result = await UserTripBookingController.paymentRequest(payload, res);
      expect(UserTripHelpers.savePayment).toHaveBeenCalled();
      expect(result.errors).toBeDefined();
    });

    it('respond if there is no submission', async () => {
      const newPayload = {
        ...payload,
        submission: undefined
      };
      await UserTripBookingController.paymentRequest(newPayload, res);
      expect(res).toHaveBeenCalled();
    });
  });
});
