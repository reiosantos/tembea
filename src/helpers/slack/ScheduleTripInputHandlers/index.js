import Cache from '../../../cache';
import InteractivePrompts from '../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../modules/slack/SlackPrompts/DialogPrompts';
import {
  SlackInteractiveMessage
} from '../../../modules/slack/SlackModels/SlackMessageModels';
import ScheduleTripController from '../../../modules/slack/TripManagement/ScheduleTripController';
import bugsnagHelper from '../../bugsnagHelper';

const createDepartmentPayloadObject = (payload, respond, forSelf = 'true') => {
  const navButtonCallbackId = forSelf === 'true' ? 'welcome_message' : 'schedule_trip_reason';
  return {
    payload,
    respond,
    navButtonCallbackId,
    navButtonValue: 'book_new_trip',
    attachmentCallbackId: 'schedule_trip_department',
  };
};

const ScheduleTripInputHandlers = {
  reason: (payload, respond, callbackId) => {
    if (payload.submission) {
      Cache.save(payload.user.id, callbackId, payload.submission.reason);
    }

    // check if user clicked for me or for someone
    if (Cache.fetch(payload.user.id).forSelf === 'true') {
      InteractivePrompts.sendAddPassengersResponse(respond);
    } else {
      InteractivePrompts.sendRiderSelectList(payload, respond);
    }
  },
  rider: (payload, respond, callbackId) => {
    if (payload.actions && payload.actions[0].selected_options[0].value) {
      const rider = payload.actions[0].selected_options[0].value;
      Cache.save(payload.user.id, callbackId, rider);
    }

    InteractivePrompts.sendAddPassengersResponse(respond, false);
  },
  addPassengers: (payload, respond) => {
    if (payload.actions[0].value || payload.actions[0].selected_options[0]) {
      const noOfPassengers = payload.actions[0].value
        ? payload.actions[0].value : payload.actions[0].selected_options[0].value;
      Cache.save(payload.user.id, 'passengers', noOfPassengers);
    }

    const { forSelf } = Cache.fetch(payload.user.id);
    const props = createDepartmentPayloadObject(payload, respond, forSelf);
    return InteractivePrompts.sendListOfDepartments(props, forSelf);
  },
  department: (payload, respond) => {
    respond(new SlackInteractiveMessage('Noted...'));
    const departmentId = payload.actions[0].value;
    Cache.save(payload.user.id, 'departmentId', departmentId);
    DialogPrompts.sendTripDetailsForm(payload, 'regularTripForm', 'schedule_trip_locationTime');
  },
  locationTime: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTripDetailsForm(payload);
      if (errors.length > 0) {
        return { errors };
      }
      respond(new SlackInteractiveMessage('Noted...'));

      const tripRequestDetails = { ...Cache.fetch(payload.user.id), ...payload.submission, tripType: 'Regular Trip' };

      await ScheduleTripController.createTripRequest(payload, respond, tripRequestDetails);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    } finally {
      Cache.delete(payload.user.id);
    }
  }
};

export default ScheduleTripInputHandlers;
