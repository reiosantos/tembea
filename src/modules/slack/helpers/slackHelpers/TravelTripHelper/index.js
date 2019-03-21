import InteractivePrompts from '../../../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../SlackPrompts/DialogPrompts';
import { SlackInteractiveMessage } from '../../../SlackModels/SlackMessageModels';
import Cache from '../../../../../cache';
import ScheduleTripController from '../../../TripManagement/ScheduleTripController';
import createTravelTripDetails from './createTravelTripDetails';
import bugsnagHelper from '../../../../../helpers/bugsnagHelper';
import LocationMapHelpers from '../../../../../helpers/googleMaps/locationsMapHelpers';
import SlackEvents from '../../../events';
import { slackEventNames } from '../../../events/slackEvents';
import Services from '../../../../../services/UserService';
import { LocationPrompts } from '../../../RouteManagement/rootFile';
import TravelLocationHelper from './travelHelper';
import GoogleMapsError from '../../../../../helpers/googleMaps/googleMapsError';

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
      await Cache.save(id, 'contactDetails', submission);
      const props = {
        payload,
        respond,
        attachmentCallbackId: 'travel_trip_department',
        navButtonCallbackId: 'back_to_launch',
        navButtonValue: 'back_to_travel_launch'
      };
      return InteractivePrompts.sendListOfDepartments(props, 'false');
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  },
  department: async (payload, respond) => {
    try {
      respond(new SlackInteractiveMessage('Noted...'));

      const { user: { id }, actions } = payload;
      const { value, name } = actions[0];
      await Cache.save(id, 'departmentId', value);
      await Cache.save(id, 'departmentName', name);

      const { tripType } = await Cache.fetch(id);
      if (tripType === 'Airport Transfer') {
        return DialogPrompts.sendTripDetailsForm(
          payload, 'travelTripFlightDetailsForm', 'travel_trip_flightDetails'
        );
      }
      return DialogPrompts.sendTripDetailsForm(
        payload, 'travelEmbassyDetailsForm', 'travel_trip_embassyForm'
      );
    } catch (error) {
      bugsnagHelper.log(error);
    }
  },
  embassyForm: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTravelDetailsForm(
        payload, 'embassy'
      );
      if (errors.length > 0) {
        return { errors };
      }

      const tripDetails = await createTravelTripDetails(payload, 'embassyVisitDateTime');
      await Cache.save(payload.user.id, 'tripDetails', tripDetails);
      InteractivePrompts.sendPreviewTripResponse(tripDetails, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  },

  flightDetails: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTravelDetailsForm(
        payload, 'airport', 'pickup'
      );
      if (errors.length > 0) {
        return { errors };
      }
      const tripDetails = await createTravelTripDetails(payload);
      await Cache.save(payload.user.id, 'tripDetails', tripDetails);
      try {
        const verifiable = await TravelLocationHelper.getPickupType(payload.submission);
        if (verifiable) respond(verifiable);
      } catch (err) {
        if (err instanceof GoogleMapsError && err.code === GoogleMapsError.UNAUTHENTICATED) {
          const message = InteractivePrompts.openDestinationDialog();
          respond(message);
        }
      }
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  },

  locationNotFound: (payload, respond) => {
    const value = payload.actions[0].name;
    if (value === 'no') {
      LocationPrompts.errorPromptMessage(respond);
    }
  },

  suggestions: async (payload, respond) => {
    const actionName = payload.actions[0].name;
    if (actionName === 'no') {
      LocationPrompts.errorPromptMessage(respond);
    } else {
      await LocationMapHelpers.locationSuggestions(payload, respond, actionName, 'travel_trip');
    }
  },

  destinationSelection: async (payload, respond) => {
    const valueName = payload.actions[0].value;
    if (valueName === 'cancel') {
      respond(
        new SlackInteractiveMessage('Thank you for using Tembea')
      );
    } else {
      await LocationMapHelpers.callDestinationSelection(payload, respond);
    }
  },

  destinationConfirmation: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTravelDetailsForm(
        payload, 'airport', 'destination'
      );
      if (errors.length > 0) {
        return { errors };
      }
      const { user: { id } } = payload;
      const { tripDetails } = await Cache.fetch(id);
      const { submission: { destination, othersDestination } } = payload;
      tripDetails.destination = destination;
      tripDetails.othersDestination = othersDestination;
      await Cache.save(payload.user.id, 'tripDetails', tripDetails);
      await TravelLocationHelper.getDestinationType(payload, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Please try again')
      );
    }
  },
  
  detailsConfirmation: async (payload, respond) => {
    try {
      const { user: { id } } = payload;
      const { tripDetails } = await Cache.fetch(id);
      const requesterData = await Services.getUserBySlackId(id);
      const tripData = LocationMapHelpers.tripCompare(tripDetails);
      tripData.requester = requesterData.dataValues.name;

      return InteractivePrompts.sendPreviewTripResponse(tripData, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage(`${error} Unsuccessful request. Please try again`)
      );
    }
  },
  
  confirmation: async (payload, respond) => {
    try {
      if (payload.actions[0].value === 'cancel') {
        return InteractivePrompts.sendCancelRequestResponse(respond);
      }
      const { tripDetails } = await Cache.fetch(payload.user.id);
      const tripRequest = await ScheduleTripController.createTravelTripRequest(
        payload, tripDetails
      );
      InteractivePrompts.sendCompletionResponse(respond, tripRequest.id);
      SlackEvents.raise(
        slackEventNames.NEW_TRAVEL_TRIP_REQUEST, tripRequest, payload, respond, 'travel'
      );
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }
};

export default travelTripHelper;
