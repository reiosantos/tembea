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
import CleanData from '../../../../../helpers/cleanData';
import Validators from '../../../../../helpers/slack/UserInputValidator/Validators';
import Notifications from '../../../SlackPrompts/Notifications';

const travelTripHelper = {
  contactDetails: async (data, respond) => {
    try {
      const payload = CleanData.trim(data);
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
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
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
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  locationNotFound: (payload, respond) => {
    const value = payload.actions[0].name;
    if (value === 'no') { LocationPrompts.errorPromptMessage(respond); }
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
      errors.push(...Validators.checkOriginAnDestination(tripDetails.pickup,
        destination, 'pickup', 'destination'));
      if (errors.length > 0) return { errors };
      tripDetails.destination = destination;
      tripDetails.othersDestination = othersDestination;
      await Cache.save(payload.user.id, 'tripDetails', tripDetails);
      await TravelLocationHelper.getDestinationType(payload, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Please try again'));
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
      respond(new SlackInteractiveMessage(`${error} Unsuccessful request. Please try again`));
    }
  },

  confirmation: async (payload, respond) => {
    try {
      if (payload.actions[0].value === 'cancel') {
        return InteractivePrompts.sendCancelRequestResponse(respond);
      }
      if (payload.actions[0].value === 'trip_note') {
        travelTripHelper.notesRequest(payload, respond);
      }
      const { tripDetails } = await Cache.fetch(payload.user.id);
      const tripRequest = await ScheduleTripController.createTravelTripRequest(
        payload, tripDetails
      );
      if (tripDetails.destination === 'To Be Decided' || tripDetails.pickup === 'To Be Decided') {
        travelTripHelper.riderRequest(payload, tripDetails, respond);
      } else {
        InteractivePrompts.sendCompletionResponse(respond, tripRequest.id, tripDetails.rider);
        SlackEvents.raise(
          slackEventNames.NEW_TRAVEL_TRIP_REQUEST, tripRequest, payload, respond, 'travel'
        );
      }
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },
  notesRequest: async (payload, respond) => {
    const { tripDetails: { tripNote } } = await Cache.fetch(payload.user.id);
    respond(new SlackInteractiveMessage('Noted ...'));
    return DialogPrompts.sendTripNotesDialogForm(payload,
      'travelTripNoteForm', 'travel_trip_tripNotesAddition',
      'Add Trip Notes', tripNote || null);
  },
  riderRequest: async (payload, tripDetails, respond) => {
    const { team: { id: teamID }, user: { id: userID } } = payload;
    const { pickup, destination, rider } = tripDetails;
    await Cache.save(rider, 'waitingRequester', userID);
    const data = {
      pickup, destination, teamID, userID, rider
    };
    await TravelLocationHelper.validatePickupDestination(data, respond);
  },
  tripNotesAddition: async (payload, respond) => {
    const { user: { id }, submission: { tripNote } } = payload;
    const { tripDetails } = await Cache.fetch(id);
    const errors = [];
    errors.push(...Validators.validateDialogSubmission(payload));
    if (errors.length) return { errors };
    tripDetails.tripNote = tripNote;
    await Cache.save(id, 'tripDetails', tripDetails);
    return InteractivePrompts.sendPreviewTripResponse(tripDetails, respond);
  },
  requesterToBeDecidedNotification: async (payload, respond) => {
    const { user: { id } } = payload;
    const valueName = payload.actions[0].value;
    let message;
    if (valueName === 'yay') {
      message = ':smiley:';
    } else {
      const { tripDetails: { rider } } = await Cache.fetch(id);
      message = `Waiting for <@${rider}>'s response...`;
    }
    respond(new SlackInteractiveMessage(message));
  },

  riderLocationConfirmation: async (payload, respond) => {
    const valueName = payload.actions[0].value;
    if (valueName === 'cancel') {
      respond(new SlackInteractiveMessage('Thank you for using Tembea'));
    } else {
      const location = valueName.split('_')[0];
      await LocationMapHelpers.callRiderLocationConfirmation(
        payload, respond, location
      );
      respond(new SlackInteractiveMessage('noted...'));
    }
  },
  OpsLocationConfirmation: async (payload, respond) => {
    const {
      user: { id: riderID },
      submission: { confirmedLocation },
      team: { id: teamID }
    } = payload;
    const { waitingRequester } = await Cache.fetch(riderID);
    const { tripDetails } = await Cache.fetch(waitingRequester);
    let location;
    if (tripDetails.pickup === 'To Be Decided') {
      tripDetails.pickup = confirmedLocation;
      location = 'Pickup';
    } else {
      tripDetails.destination = confirmedLocation;
      location = 'Destination';
    }
    await Cache.save(waitingRequester, 'tripDetails', tripDetails);
    await Notifications.sendOperationsRiderlocationConfirmation({
      riderID, teamID, confirmedLocation, waitingRequester, location
    }, respond);

    const message = TravelLocationHelper.responseMessage(
      'Travel confirmation request.', `Thank you <@${riderID}> for your time.`,
      'We shall get back to you shortly :smiley:', 'yay'
    );
    respond(message);
  }
};
export default travelTripHelper;
