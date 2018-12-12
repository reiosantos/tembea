import Cache from '../../../cache';
import InteractivePrompts from '../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../modules/slack/SlackPrompts/DialogPrompts';
import {
  SlackInteractiveMessage
} from '../../../modules/slack/SlackModels/SlackMessageModels';
import ScheduleTripController from '../../../modules/slack/TripManagement/ScheduleTripController';

const ScheduleTripInputHandlers = {
  reason: (payload, respond, callbackId) => {
    if (payload.submission) {
      Cache.save(payload.user.id, callbackId, payload.submission.reason);
    }

    // check if user clicked for me or for someone
    if (Cache.fetch(payload.user.id).forSelf === 'true') {
      return InteractivePrompts.sendListOfDepartments(payload, respond);
    }
    InteractivePrompts.sendRiderSelectList(payload, respond);
  },
  rider: (payload, respond, callbackId) => {
    const rider = payload.actions[0].selected_options[0].value;
    Cache.save(payload.user.id, callbackId, rider);
    InteractivePrompts.sendListOfDepartments(payload, respond, false);
  },
  department: (payload, respond) => {
    respond(new SlackInteractiveMessage('Loading...'));

    const departmentId = payload.actions[0].value;
    Cache.save(payload.user.id, 'departmentId', departmentId);
    DialogPrompts.sendTripDetailsForm(payload);
  },
  locationTime: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTripDetailsForm(payload);
      if (errors.length > 0) {
        return { errors };
      }
      respond(new SlackInteractiveMessage('Loading...'));

      const tripRequestDetails = { ...Cache.fetch(payload.user.id), ...payload.submission };

      await ScheduleTripController.createTripRequest(payload, respond, tripRequestDetails);
    } catch (error) {
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }
};

export default ScheduleTripInputHandlers;
