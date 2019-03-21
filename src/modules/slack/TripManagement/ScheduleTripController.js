import SlackEvents from '../events';
import Utils from '../../../utils';
import { slackEventNames } from '../events/slackEvents';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import Validators from '../../../helpers/slack/UserInputValidator/Validators';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import validateDialogSubmission
  from '../../../helpers/slack/UserInputValidator/validateDialogSubmission';
import AddressService from '../../../services/AddressService';
import TripDetailsService from '../../../services/TripDetailsService';
import tripService, { TripService } from '../../../services/TripService';

class ScheduleTripController {
  static validateTravelContactDetailsForm(payload) {
    const errors = [];
    errors.push(...UserInputValidator.validateTravelContactDetails(payload));
    return errors;
  }

  static async validateTravelDetailsForm(payload, tripType, status = 'standard') {
    const { submission } = payload;
    const travelDateTime = submission.flightDateTime || submission.embassyVisitDateTime;
    const dateFieldName = tripType === 'embassy' ? 'embassyVisitDateTime' : 'flightDateTime';
    const allowedHours = tripType === 'embassy' ? 3 : 4;
    return this.passedStatus(submission, payload, status,
      travelDateTime, dateFieldName, allowedHours);
  }

  static async passedStatus(submission, payload, status,
    travelDateTime, dateFieldName, allowedHours) {
    const errors = [];
    if (status === 'pickup' || 'destination') {
      errors.push(...await UserInputValidator.validatePickupDestinationEntry(payload, status,
        dateFieldName, travelDateTime, allowedHours));
    } else {
      errors.push(...UserInputValidator.validateTravelFormSubmission(submission));
      errors.push(...await UserInputValidator.validateDateAndTimeEntry(payload,
        dateFieldName));
      errors.push(...UserInputValidator.validateLocationEntries(payload));
      errors.push(...Validators.checkDateTimeIsHoursAfterNow(allowedHours,
        travelDateTime, dateFieldName));
      errors.push(...validateDialogSubmission(payload));
    }
    return errors;
  }

  static async validateTripDetailsForm(payload, typeOfDialogBox) {
    const errors = [];
    try {
      if (typeOfDialogBox === 'pickup') {
        errors.push(...UserInputValidator
          .validatePickupDestinationLocationEntries(payload, typeOfDialogBox));
        errors.push(...await UserInputValidator.validateDateAndTimeEntry(payload));
      } else if (typeOfDialogBox === 'destination') {
        errors.push(...UserInputValidator
          .validatePickupDestinationLocationEntries(payload, typeOfDialogBox));
      }
      return errors;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async getLocationIds(tripRequestDetails) {
    const {
      destination, pickup, othersPickup, othersDestination
    } = tripRequestDetails;
    const pickupAddress = pickup === 'Others' ? othersPickup : pickup;
    const destinationAddress = destination === 'Others' ? othersDestination : destination;
    const originId = await this.createLocation(pickupAddress, 23, 24);
    const destinationId = await this.createLocation(destinationAddress, 15, 30);
    return { originId, destinationId };
  }

  static async createRequestObject(tripRequestDetails, requester, timezone) {
    try {
      const {
        reason, dateTime, departmentId, destination, pickup,
        othersPickup, othersDestination, passengers, tripType
      } = tripRequestDetails;
      const { originId, destinationId } = await ScheduleTripController.getLocationIds(tripRequestDetails);
      const pickupName = `${pickup === 'Others' ? othersPickup : pickup}`;
      const destinationName = `${destination === 'Others' ? othersDestination : destination}`;
      const name = `From ${pickupName} to ${destinationName} on ${dateTime}`;
      const departureTime = Utils.formatDateForDatabase(dateTime, timezone);
      return {
        riderId: requester.id,
        name,
        reason,
        departmentId,
        tripStatus: 'Pending',
        departureTime,
        requestedById: requester.id,
        originId,
        destinationId,
        noOfPassengers: passengers,
        tripType
      };
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async createRequest(payload, tripRequestDetails) {
    try {
      const { user: { id: slackUserId }, team: { id: teamId } } = payload;
      const [requester, slackInfo] = await Promise.all([
        SlackHelpers.findOrCreateUserBySlackId(slackUserId, teamId),
        SlackHelpers.getUserInfoFromSlack(slackUserId, teamId)
      ]);

      const request = await ScheduleTripController.createRequestObject(tripRequestDetails, requester, slackInfo.tz);

      if (tripRequestDetails.forSelf === 'false') {
        const { rider } = tripRequestDetails;
        const passenger = await SlackHelpers.findOrCreateUserBySlackId(rider, teamId);
        request.riderId = passenger.id;
      }
      return request;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async createTripRequest(payload, respond, tripRequestDetails) {
    try {
      const tripRequest = await ScheduleTripController.createRequest(payload, tripRequestDetails);
      const trip = await TripService.createRequest(tripRequest);
      
      InteractivePrompts.sendCompletionResponse(respond, trip.id);
      SlackEvents.raise(slackEventNames.NEW_TRIP_REQUEST, payload, trip, respond);

      return true;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async createTravelTripRequest(payload, tripDetails) {
    try {
      const tripRequest = await ScheduleTripController.createRequest(payload, tripDetails);
      const { id } = await ScheduleTripController.createTripDetail(tripDetails);
      const tripData = { ...tripRequest, tripDetailId: id };
      const trip = await TripService.createRequest(tripData);
      return tripService.getById(trip.id, true);
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async createLocation(address, longitude, latitude) {
    try {
      const addressData = await AddressService.createNewAddress(
        longitude, latitude, address
      );
      return addressData.id;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async createTripDetail(tripInfo) {
    try {
      const { riderPhoneNo, travelTeamPhoneNo, flightNumber } = tripInfo;
      const tripDetail = await TripDetailsService.createDetails(
        riderPhoneNo,
        travelTeamPhoneNo,
        flightNumber
      );

      return tripDetail.dataValues;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }
}

export default ScheduleTripController;
