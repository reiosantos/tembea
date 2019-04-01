import Cache from '../../../cache';
import InteractivePrompts from '../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../modules/slack/SlackPrompts/DialogPrompts';
import {
  SlackInteractiveMessage
} from '../../../modules/slack/SlackModels/SlackMessageModels';
import ScheduleTripController from '../../../modules/slack/TripManagement/ScheduleTripController';
import bugsnagHelper from '../../bugsnagHelper';
import validateDialogSubmission from '../UserInputValidator/validateDialogSubmission';

const createDepartmentPayloadObject = (payload, respond, forSelf = 'true') => {
  const navButtonCallbackId = forSelf === 'true' ? 'schedule_trip_reason' : 'schedule_trip_rider';
  return {
    payload,
    respond,
    navButtonCallbackId,
    navButtonValue: 'book_new_trip',
    attachmentCallbackId: 'schedule_trip_department',
  };
};

const ScheduleTripInputHandlers = {
  reason: async (payload, respond, callbackId) => {
    const checkIfEmpty = validateDialogSubmission(payload);
    if (checkIfEmpty.length) return { errors: checkIfEmpty };
    if (payload.submission) {
      await Cache.save(payload.user.id, callbackId, payload.submission.reason);
    }

    // check if user clicked for me or for someone
    const userValue = await Cache.fetch(payload.user.id);
    if (userValue.forSelf === 'true') {
      InteractivePrompts.sendAddPassengersResponse(respond);
    } else {
      InteractivePrompts.sendRiderSelectList(payload, respond);
    }
  },
  rider: async (payload, respond, callbackId) => {
    if (payload.actions[0].selected_options) {
      const rider = payload.actions[0].selected_options[0].value;
      await Cache.save(payload.user.id, callbackId, rider);
    }

    InteractivePrompts.sendAddPassengersResponse(respond, 'false');
  },
  addPassengers: async (payload, respond) => {
    if (payload.actions[0].value || payload.actions[0].selected_options[0]) {
      const noOfPassengers = payload.actions[0].value
        ? payload.actions[0].value : payload.actions[0].selected_options[0].value;
      await Cache.save(payload.user.id, 'passengers', noOfPassengers);
    }

    const { forSelf } = await Cache.fetch(payload.user.id);
    const props = createDepartmentPayloadObject(payload, respond, forSelf);
    return InteractivePrompts.sendListOfDepartments(props, forSelf);
  },

  department: async (payload, respond) => {
    respond(new SlackInteractiveMessage('Noted...'));
    const departmentId = payload.actions[0].value;
    await Cache.save(payload.user.id, 'departmentId', departmentId);
    DialogPrompts.sendTripDetailsForm(payload, 'regularTripForm',
      'schedule_trip_tripDestination', 'Pickup Details');
  },

  tripDestination: async (payload, respond) => {
    const { submission, user: { id: userId } } = payload;
    try {
      const errors = await ScheduleTripController.validateTripDetailsForm(payload, 'pickup');
      if (errors.length > 0) {
        return { errors };
      }
      if (submission.pickup !== 'Others') {
        await Cache.save(`${userId}_pickup`, 'pickupLocation', submission);
        InteractivePrompts.sendSelectDestination(respond);
      }
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  selectDestination: async (payload, respond) => {
    try {
      respond(new SlackInteractiveMessage('Noted...'));
      DialogPrompts.sendTripDetailsForm(payload, 'tripDestinationLocationForm',
        'schedule_trip_locationTime', 'Destination Details');
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  locationTime: async (payload, respond) => {
    try {
      const { submission, user: { id: userId } } = payload;
      const { pickupLocation } = await Cache.fetch(`${userId}_pickup`);
      const payloadCopy = { ...payload };
      const tripsObject = {
        ...pickupLocation,
        ...submission
      };
      payloadCopy.submission = tripsObject;
      const errors = await ScheduleTripController
        .validateTripDetailsForm(payloadCopy, 'destination');
      if (errors.length > 0) {
        return { errors };
      }
      respond(new SlackInteractiveMessage('Noted...'));

      const tripType = 'Regular Trip';
      const userObj = await Cache.fetch(userId);
      const tripRequestDetails = { ...userObj, ...tripsObject, tripType };

      await ScheduleTripController.createTripRequest(payloadCopy, respond, tripRequestDetails);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }
};

export default ScheduleTripInputHandlers;
