import InteractivePrompts from '../../../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../../../SlackPrompts/DialogPrompts';
import { SlackInteractiveMessage } from '../../../SlackModels/SlackMessageModels';
import Cache from '../../../../../cache';
import ScheduleTripController from '../../../TripManagement/ScheduleTripController';
import Utils from '../../../../../utils';

const travelTripHelper = {
  contactDetails: async (payload, respond) => {
    try {
      const errors = await ScheduleTripController.validateTravelContactDetailsForm(
        payload
      );
      if (errors.length > 0) {
        return { errors };
      }

      const {
        user: { id },
        submission
      } = payload;
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
    respond(new SlackInteractiveMessage('Loading...'));
    const {
      user: { id },
      actions
    } = payload;
    const { value, name } = actions[0];
    Cache.save(id, 'departmentId', value);
    Cache.save(id, 'departmentName', name);
    DialogPrompts.sendTravelTripDetailsForm(payload, 'flightDetails');
  },
  formatTripDetails: (id, submission) => {
    const cachedData = Cache.fetch(id);
    const {
      departmentId, departmentName, contactDetails, tripType
    } = cachedData;

    const tripDetails = {
      departmentId,
      departmentName,
      ...contactDetails,
      ...submission,
      dateTime: Utils.removeHoursFromDate(3, submission.flightDateTime),
      tripType,
      forSelf: 'false',
      reason: 'Airport Transfer',
      passengers: contactDetails.noOfPassengers
    };
    return tripDetails;
  },
  flightDetails: async (payload, respond) => {
    const {
      user: { id }, submission
    } = payload;
    try {
      const errors = await ScheduleTripController.validateTravelFlightDetailsForm(payload);
      if (errors.length > 0) {
        return { errors };
      }
      const tripDetails = travelTripHelper.formatTripDetails(id, submission);

      Cache.save(id, 'tripDetails', tripDetails);
      return InteractivePrompts.sendPreviewTripResponse(tripDetails, respond);
    } catch (error) {
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  },
  confirmation: (payload, respond) => {
    const {
      user: { id },
      actions
    } = payload;
    if (actions[0].value === 'cancel') {
      return InteractivePrompts.sendCancelRequestResponse(respond);
    }
    const cachedData = Cache.fetch(id);
    const { tripDetails } = cachedData;
    return ScheduleTripController.createTravelTripRequest(
      payload,
      respond,
      tripDetails
    );
  }
};

export default travelTripHelper;
