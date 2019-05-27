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

export const getTravelKey = id => `TRAVEL_REQUEST_${id}`;

class TravelTripHelper {
  static async contactDetails(data, respond) {
    try {
      const payload = CleanData.trim(data);
      const errors = await ScheduleTripController.validateTravelContactDetailsForm(
        payload
      );
      if (errors.length > 0) {
        return { errors };
      }

      const { user: { id }, submission } = payload;
      await Cache.save(getTravelKey(id), 'contactDetails', submission);
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
  }

  static async department(payload, respond) {
    try {
      respond(new SlackInteractiveMessage('Noted...'));
      const { user: { id }, actions } = payload;
      const { value, name } = actions[0];
      await Cache.save(getTravelKey(id), 'departmentId', value);
      await Cache.save(getTravelKey(id), 'departmentName', name);

      const { tripType } = await Cache.fetch(getTravelKey(id));
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
  }

  static async embassyForm(payload, respond) {
    try {
      const { user: { id } } = payload;
      const errors = await ScheduleTripController.validateTravelDetailsForm(
        payload, 'embassy'
      );
      if (errors.length > 0) {
        return { errors };
      }
      const tripDetails = await createTravelTripDetails(payload, 'embassyVisitDateTime');
      await Cache.save(getTravelKey(id), 'tripDetails', tripDetails);
      InteractivePrompts.sendPreviewTripResponse(tripDetails, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }

  static async flightDetails(payload, respond) {
    try {
      const { user: { id } } = payload;
      const errors = await ScheduleTripController.validateTravelDetailsForm(
        payload, 'airport', 'pickup'
      );
      if (errors.length > 0) {
        return { errors };
      }
      const tripDetails = await createTravelTripDetails(payload);
      await Cache.save(getTravelKey(id), 'tripDetails', tripDetails);
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
  }

  static locationNotFound(payload, respond) {
    const value = payload.actions[0].name;
    if (value === 'no') { LocationPrompts.errorPromptMessage(respond); }
  }

  static async suggestions(payload, respond) {
    const actionName = payload.actions[0].name;
    if (actionName === 'no') {
      LocationPrompts.errorPromptMessage(respond);
    } else {
      await LocationMapHelpers.locationSuggestions(payload, respond, actionName, 'travel_trip');
    }
  }

  static async destinationSelection(payload, respond) {
    const valueName = payload.actions[0].value;
    if (valueName === 'cancel') {
      respond(
        new SlackInteractiveMessage('Thank you for using Tembea')
      );
    } else {
      await LocationMapHelpers.callDestinationSelection(payload, respond);
    }
  }

  static async destinationConfirmation(payload, respond) {
    try {
      const errors = await ScheduleTripController.validateTravelDetailsForm(
        payload, 'airport', 'destination'
      );
      if (errors.length > 0) {
        return { errors };
      }
      const { user: { id } } = payload;
      const { tripDetails } = await Cache.fetch(getTravelKey(id));
      const { submission: { destination, othersDestination } } = payload;
      errors.push(...Validators.checkOriginAnDestination(tripDetails.pickup,
        destination, 'pickup', 'destination'));
      if (errors.length > 0) return { errors };
      tripDetails.destination = destination;
      tripDetails.othersDestination = othersDestination;
      await Cache.save(getTravelKey(id), 'tripDetails', tripDetails);
      await TravelLocationHelper.getDestinationType(payload, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Please try again'));
    }
  }

  static async detailsConfirmation(payload, respond) {
    try {
      const { user: { id } } = payload;
      const { tripDetails } = await Cache.fetch(getTravelKey(id));
      const requesterData = await Services.getUserBySlackId(id);
      const tripData = LocationMapHelpers.tripCompare(tripDetails);
      tripData.requester = requesterData.dataValues.name;
      return InteractivePrompts.sendPreviewTripResponse(tripData, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage(`${error} Unsuccessful request. Please try again`));
    }
  }

  static async confirmation(payload, respond) {
    try {
      const { user: { id } } = payload;
      if (payload.actions[0].value === 'cancel') {
        return InteractivePrompts.sendCancelRequestResponse(respond);
      }
      if (payload.actions[0].value === 'trip_note') {
        return TravelTripHelper.notesRequest(payload, respond);
      }

      const { tripDetails } = await Cache.fetch(getTravelKey(id));
      const tripRequest = await ScheduleTripController.createTravelTripRequest(
        payload, tripDetails
      );
      if (tripDetails.destination === 'To Be Decided' || tripDetails.pickup === 'To Be Decided') {
        TravelTripHelper.riderRequest(payload, tripDetails, respond);
      } else {
        return TravelTripHelper.sendCompletedResponseToOps(
          tripRequest, tripDetails, respond, payload
        );
      }
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }

  static async notesRequest(payload, respond) {
    const { user: { id } } = payload;
    const { tripDetails: { tripNote } } = await Cache.fetch(getTravelKey(id));
    respond(new SlackInteractiveMessage('Noted ...'));
    return DialogPrompts.sendTripNotesDialogForm(payload,
      'travelTripNoteForm', 'travel_trip_tripNotesAddition',
      'Add Trip Notes', tripNote || null);
  }

  static async riderRequest(payload, tripDetails, respond) {
    const { team: { id: teamID }, user: { id: userID } } = payload;
    const { pickup, destination, rider } = tripDetails;
    await Cache.save(getTravelKey(rider), 'waitingRequester', userID);
    const data = {
      pickup, destination, teamID, userID, rider
    };
    await TravelLocationHelper.validatePickupDestination(data, respond);
  }

  static async tripNotesAddition(payload, respond) {
    const { user: { id }, submission: { tripNote } } = payload;
    const { tripDetails } = await Cache.fetch(getTravelKey(id));
    const errors = [];
    errors.push(...Validators.validateDialogSubmission(payload));
    if (errors.length) return { errors };
    tripDetails.tripNote = tripNote;
    await Cache.save(getTravelKey(id), 'tripDetails', tripDetails);
    return InteractivePrompts.sendPreviewTripResponse(tripDetails, respond);
  }

  static async requesterToBeDecidedNotification(payload, respond) {
    const { user: { id } } = payload;
    const valueName = payload.actions[0].value;
    let message;
    if (valueName === 'yay') {
      message = ':smiley:';
    } else {
      const { tripDetails: { rider } } = await Cache.fetch(getTravelKey(id));
      message = `Waiting for <@${rider}>'s response...`;
    }
    respond(new SlackInteractiveMessage(message));
  }

  static async riderLocationConfirmation(payload, respond) {
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
  }

  static updateLocationInfo(tripDetails, confirmedLocation) {
    let location;
    const updatedTripDetails = { ...tripDetails };
    if (updatedTripDetails.pickup === 'To Be Decided') {
      updatedTripDetails.pickup = confirmedLocation;
      location = 'Pickup';
    } else {
      updatedTripDetails.destination = confirmedLocation;
      location = 'Destination';
    }

    return { updatedTripDetails, location };
  }

  static async completeTravelConfirmation(payload, respond) {
    try {
      const {
        user: { id: riderID }, submission: { confirmedLocation }, team: { id: teamID }
      } = payload;
      const { waitingRequester } = await Cache.fetch(getTravelKey(riderID));
      const { tripDetails } = await Cache.fetch(getTravelKey(waitingRequester));
      const { location, updatedTripDetails } = TravelTripHelper.updateLocationInfo(
        tripDetails, confirmedLocation
      );
      const tripRequest = await ScheduleTripController.createTravelTripRequest(
        payload, updatedTripDetails
      );

      await Cache.save(getTravelKey(waitingRequester), 'tripDetails', updatedTripDetails);
      await Notifications.sendOperationsRiderlocationConfirmation({
        riderID, teamID, confirmedLocation, waitingRequester, location
      }, respond);

      return TravelTripHelper.sendCompletedResponseToOps(
        tripRequest, updatedTripDetails, respond, payload
      );
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }

  static async sendCompletedResponseToOps(tripRequest, tripData, respond, payload) {
    InteractivePrompts.sendCompletionResponse(respond, tripRequest.id, tripData.rider);
    SlackEvents.raise(
      slackEventNames.NEW_TRAVEL_TRIP_REQUEST, tripRequest, payload, respond, 'travel'
    );
  }
}
export default TravelTripHelper;
