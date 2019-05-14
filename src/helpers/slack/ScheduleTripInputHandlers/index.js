import Cache from '../../../cache';
import InteractivePrompts from '../../../modules/slack/SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../modules/slack/SlackPrompts/DialogPrompts';
import {
  SlackInteractiveMessage
} from '../../../modules/slack/SlackModels/SlackMessageModels';
import ScheduleTripController from '../../../modules/slack/TripManagement/ScheduleTripController';
import bugsnagHelper from '../../bugsnagHelper';
import LocationHelpers from '../../googleMaps/locationsMapHelpers';
import Validators from '../UserInputValidator/Validators';
import UserInputValidator from '../UserInputValidator';
import GoogleMapsError from '../../googleMaps/googleMapsError';
import TripHelper from '../../TripHelper';
import UpdateSlackMessageHelper from '../updatePastMessageHelper';

export const getTripKey = userId => `TRIP_IN_PROCESS_${userId}`;

export const createDepartmentPayloadObject = (payload, respond, forSelf = 'true') => {
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
    const data = { text: 'Noted...' };
    if (payload.state) {
      await UpdateSlackMessageHelper.updateMessage(payload.state, data);
    }

    if (payload.submission) {
      const checkIfEmpty = Validators.validateDialogSubmission(payload);
      if (checkIfEmpty.length) {
        return {
          errors: checkIfEmpty
        };
      }
      if (payload.submission.reason) {
        await Cache.save(getTripKey(payload.user.id), callbackId, payload.submission.reason);
      }
    }

    // check if user clicked for me or for someone
    const userValue = await Cache.fetch(getTripKey(payload.user.id));
    if (userValue.forSelf === 'true') {
      InteractivePrompts.sendAddPassengersResponse(respond);
    } else {
      InteractivePrompts.sendRiderSelectList(payload, respond);
    }
  },
  rider: async (payload, respond, callbackId) => {
    if (payload.actions[0].selected_options) {
      const rider = payload.actions[0].selected_options[0].value;
      await Cache.save(getTripKey(payload.user.id), callbackId, rider);
    }

    InteractivePrompts.sendAddPassengersResponse(respond, 'false');
  },
  addPassengers: async (payload, respond) => {
    const noOfPassengers = payload.actions[0].value
      ? payload.actions[0].value : payload.actions[0].selected_options[0].value;

    if (noOfPassengers !== 'called_back_button') {
      await Cache.save(getTripKey(payload.user.id), 'passengers', noOfPassengers);
    }
    const {
      forSelf
    } = await Cache.fetch(getTripKey(payload.user.id));
    const props = createDepartmentPayloadObject(payload, respond, forSelf);
    return InteractivePrompts.sendListOfDepartments(props, forSelf);
  },

  department: async (payload) => {
    const department = payload.actions[0];
    await Cache.save(getTripKey(payload.user.id), 'department', department);
    DialogPrompts.sendTripDetailsForm(payload, 'regularTripForm',
      'schedule_trip_tripPickup', 'Pickup Details');
  },

  tripPickup: async (payload, respond) => {
    const data = { text: 'Noted...' };
    await UpdateSlackMessageHelper.updateMessage(payload.state, data);
    const {
      submission: { pickup, othersPickup, dateTime }, user: { id: userId, name }
    } = payload;
    try {
      const errors = await ScheduleTripController.validateTripDetailsForm(payload, 'pickup');
      if (errors.length) return { errors };
      const tripData = await TripHelper
        .updateTripData(userId, name, pickup, othersPickup, dateTime, 'Regular Trip');
      await Cache.saveObject(getTripKey(userId), tripData);
      if (pickup !== 'Others') {
        return InteractivePrompts.sendSelectDestination(respond);
      }
      const verifiable = await LocationHelpers
        .locationVerify(payload.submission, 'pickup', 'schedule_trip');
      respond(verifiable);
    } catch (error) {
      bugsnagHelper.log(error);
      if (error instanceof GoogleMapsError && error.code === GoogleMapsError.UNAUTHENTICATED) {
        return InteractivePrompts.sendSelectDestination(respond);
      }
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  destinationSelection: async (payload, respond) => {
    try {
      return await DialogPrompts.sendTripDetailsForm(payload, 'tripDestinationLocationForm',
        'schedule_trip_confirmDestination', 'Destination Details');
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  confirmDestination: async (payload, respond) => {
    const data = { text: 'Noted...' };
    await UpdateSlackMessageHelper.updateMessage(payload.state, data);
    let tripData;
    try {
      const payloadCopy = { ...payload };
      const { submission: { destination, othersDestination }, user: { id: userId } } = payload;
      const tripDetails = await Cache.fetch(getTripKey(userId));
      tripDetails.destination = destination;
      tripDetails.othersDestination = othersDestination;
      payloadCopy.submission.pickup = tripDetails.pickup;
      payloadCopy.submission.othersPickup = tripDetails.othersPickup;
      const errors = await ScheduleTripController.validateTripDetailsForm(payloadCopy, 'destination');
      if (errors.length) return { errors };
      const updatedTripData = await TripHelper.getDestinationCoordinates(destination, tripDetails);

      tripData = UserInputValidator.getScheduleTripDetails(updatedTripData);
      await Cache.saveObject(getTripKey(userId), tripData);
      if (destination !== 'Others') return InteractivePrompts.sendScheduleTripResponse(tripData, respond);
      const verifiable = await LocationHelpers.locationVerify(payload.submission, 'destination', 'schedule_trip');
      respond(verifiable);
    } catch (error) {
      bugsnagHelper.log(error);
      if (error instanceof GoogleMapsError && error.code === GoogleMapsError.UNAUTHENTICATED) {
        return InteractivePrompts.sendScheduleTripResponse(tripData, respond);
      }
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  detailsConfirmation: async (payload, respond) => {
    try {
      const { user: { id: userId } } = payload;
      const tripDetails = await Cache.fetch(getTripKey(userId));
      const tripData = UserInputValidator.getScheduleTripDetails(tripDetails);
      if (tripData.pickup === tripData.destination) {
        respond(new SlackInteractiveMessage('Pickup and Destination cannot be the same...'));
        return await DialogPrompts.sendTripDetailsForm(payload, 'tripDestinationLocationForm',
          'schedule_trip_confirmDestination', 'Destination Details');
      }
      await Cache.saveObject(getTripKey(userId), tripData);

      return InteractivePrompts.sendScheduleTripResponse(tripData, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  confirmation: async (payload, respond) => {
    try {
      const { user: { id: userId } } = payload;
      const tripDetails = await Cache.fetch(getTripKey(userId));
      await ScheduleTripController.createTripRequest(payload, respond, tripDetails);
      await Cache.delete(getTripKey(userId));
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  suggestions: async (payload, respond) => {
    try {
      const actionName = payload.actions[0].name;
      await LocationHelpers.locationSuggestions(payload, respond, actionName, 'schedule_trip');
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },

  locationNotFound: (payload, respond) => {
    respond(new SlackInteractiveMessage(
      'Sorry😞, your location wasn\'t found on the map...contact the ops team'
    ));
  },
};

export default ScheduleTripInputHandlers;
