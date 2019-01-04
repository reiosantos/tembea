import InteractivePrompts from '../../../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../SlackPrompts/DialogPrompts';
import { SlackInteractiveMessage } from '../../../SlackModels/SlackMessageModels';
import Cache from '../../../../../cache';
import ScheduleTripController from '../../../TripManagement/ScheduleTripController';
import createTravelTripDetails from './createTravelTripDetails';
import SlackEvents from '../../../events';
import { slackEventNames } from '../../../events/slackEvents';

const travelTripHelper = {
  contactDetails: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTravelContactDetailsForm(
        payload
      );
      if (errors.length > 0) {
        return { errors };
      }

      const { user: { id }, submission } = payload;
      Cache.save(id, 'contactDetails', submission);

      const props = {
        payload,
        respond,
        attachmentCallbackId: 'travel_trip_department',
        navButtonCallbackId: 'back_to_launch',
        navButtonValue: 'back_to_travel_launch'
      };
      return InteractivePrompts.sendListOfDepartments(props, 'false');
    } catch (error) {
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  },
  department: (payload, respond) => {
    respond(new SlackInteractiveMessage('Noted...'));

    const { user: { id }, actions } = payload;
    const { value, name } = actions[0];
    Cache.save(id, 'departmentId', value);
    Cache.save(id, 'departmentName', name);

    if (Cache.fetch(id).tripType === 'Airport Transfer') {
      return DialogPrompts.sendTripDetailsForm(payload, 'travelTripFlightDetailsForm', 'travel_trip_flightDetails');
    }
    return DialogPrompts.sendTripDetailsForm(payload, 'travelEmbassyDetailsForm', 'travel_trip_embassyForm');
  },
  embassyForm: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTravelDetailsForm(
        payload, 'embassy'
      );
      if (errors.length > 0) {
        return { errors };
      }

      const tripDetails = createTravelTripDetails(payload, 'embassyVisitDateTime');
      Cache.save(payload.user.id, 'tripDetails', tripDetails);
      InteractivePrompts.sendPreviewTripResponse(tripDetails, respond);
    } catch (error) {
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  },
  flightDetails: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTravelDetailsForm(
        payload, 'airport'
      );
      if (errors.length > 0) {
        return { errors };
      }
      const tripDetails = createTravelTripDetails(payload);
      Cache.save(payload.user.id, 'tripDetails', tripDetails);
      return InteractivePrompts.sendPreviewTripResponse(tripDetails, respond);
    } catch (error) {
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  },
  confirmation: async (payload, respond) => {
    try {
      if (payload.actions[0].value === 'cancel') {
        return InteractivePrompts.sendCancelRequestResponse(respond);
      }
      const { tripDetails } = Cache.fetch(payload.user.id);
      const tripRequest = await ScheduleTripController.createTravelTripRequest(
        payload, tripDetails
      );
      const { newPayload, id } = tripRequest;
      InteractivePrompts.sendCompletionResponse(newPayload, respond, id);
      SlackEvents.raise(
        slackEventNames.NEW_TRAVEL_TRIP_REQUEST, id, payload, respond, 'travel'
      );
    } catch (error) {
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }
};

export default travelTripHelper;
