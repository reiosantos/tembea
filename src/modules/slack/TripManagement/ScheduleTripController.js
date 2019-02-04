import SlackEvents from '../events';
import Utils from '../../../utils';
import { slackEventNames } from '../events/slackEvents';
import models from '../../../database/models';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import Validators from '../../../helpers/slack/UserInputValidator/Validators';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import SlackHelpers from '../../../helpers/slack/slackHelpers';

const {
  TripRequest, Location, Address, TripDetail
} = models;

class ScheduleTripController {
  static validateTravelContactDetailsForm(payload) {
    const errors = [];
    errors.push(...UserInputValidator.validateTravelContactDetails(payload));
    return errors;
  }

  static async validateTravelDetailsForm(payload, tripType) {
    const { submission } = payload;
    const travelDateTime = submission.flightDateTime || submission.embassyVisitDateTime;
    const dateFieldName = tripType === 'embassy' ? 'embassyVisitDateTime' : 'flightDateTime';
    const allowedHours = tripType === 'embassy' ? 3 : 4;
    const errors = [];

    errors.push(...await UserInputValidator.validateTravelFormSubmission(submission));
    errors.push(...await UserInputValidator.validateDateAndTimeEntry(payload,
      dateFieldName));
    errors.push(...await Validators.checkDateTimeIsHoursAfterNow(allowedHours,
      travelDateTime, dateFieldName));

    return errors;
  }

  static async validateTripDetailsForm(payload) {
    const errors = [];

    try {
      errors.push(...UserInputValidator.validateLocationEntries(payload));
      errors.push(...await UserInputValidator.validateDateAndTimeEntry(payload));
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
    const destinationAdress = destination === 'Others' ? othersDestination : destination;

    const originId = await this.createLocation(pickupAddress, 23, 24);
    const destinationId = await this.createLocation(destinationAdress, 15, 30);

    return { originId, destinationId };
  }

  static async createRequestObject(tripRequestDetails, requester) {
    try {
      const {
        reason, dateTime, departmentId, destination, pickup,
        othersPickup, othersDestination, passengers, tripType
      } = tripRequestDetails;
      const { originId, destinationId } = await this.getLocationIds(tripRequestDetails);
      const name = `From ${pickup === 'Others' ? othersPickup : pickup}
      to ${destination === 'Others' ? othersDestination : destination}
      on ${dateTime}`;

      const departureTime = Utils.formatDateForDatabase(dateTime);

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
      const requester = await SlackHelpers.findOrCreateUserBySlackId(slackUserId, teamId);
      const request = await this.createRequestObject(tripRequestDetails, requester);

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
      const tripRequest = await this.createRequest(payload, tripRequestDetails);
      const trip = await TripRequest.create(tripRequest);

      InteractivePrompts.sendCompletionResponse(payload, respond, trip.id);
      SlackEvents.raise(slackEventNames.NEW_TRIP_REQUEST, payload, trip.dataValues, respond);

      return true;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async createTravelTripRequest(payload, tripDetails) {
    try {
      const tripRequest = await this.createRequest(payload, tripDetails);
      const { id } = await this.createTripDetail(tripDetails);

      const tripData = { ...tripRequest, tripDetailId: id };
      const trip = await TripRequest.create(tripData);
      const newPayload = { ...payload, submission: { rider: false } };
      return { newPayload, id: trip.id };
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async createLocation(address, longitude, latitude) {
    try {
      const [location] = await Location.findOrCreate({
        where: { longitude, latitude }
      });
      const addressData = await Address.create({ locationId: location.dataValues.id, address });
      return addressData.dataValues.id;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }

  static async createTripDetail(tripInfo) {
    try {
      const { riderPhoneNo, travelTeamPhoneNo, flightNumber } = tripInfo;
      const tripDetail = await TripDetail.create({
        riderPhoneNo,
        travelTeamPhoneNo,
        flightNumber
      });

      return tripDetail.dataValues;
    } catch (error) {
      bugsnagHelper.log(error);
      throw error;
    }
  }
}

export default ScheduleTripController;
