import SlackEvents from '../events';
import Utils from '../../../utils';
import { slackEventsNames } from '../events/slackEvents';
import models from '../../../database/models';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import dateHelper from '../../../helpers/dateHelper';
import TeamDetailsService from '../../../services/TeamDetailsService';

const {
  TripRequest, User, Location, Address
} = models;

class ScheduleTripController {
  static async validateTripDetailsForm(payload) {
    const errors = [];

    try {
      errors.push(...UserInputValidator.validateLocationEntries(payload));
      errors.push(...await UserInputValidator.validateDateAndTimeEntry(payload));
      return errors;
    } catch (error) {
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
        reason, dateTime, departmentId, destination, pickup, othersPickup, othersDestination, passengers
      } = tripRequestDetails;
      const { originId, destinationId } = await this.getLocationIds(tripRequestDetails);
      const name = `From ${pickup === 'Others' ? othersPickup : pickup}
      to ${destination === 'Others' ? othersDestination : destination}
      on ${dateTime}`;

      const departureTime = Utils.formatDateForDatabase(dateHelper.changeDateFormat(dateTime));

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
        noOfPassengers: passengers
      };
    } catch (error) {
      throw error;
    }
  }

  static async createRequest(payload, tripRequestDetails) {
    try {
      const requester = await ScheduleTripController.createUser(payload.user.id, payload.team.id);
      const request = await this.createRequestObject(tripRequestDetails, requester);

      if (tripRequestDetails.forSelf === 'false') {
        const passenger = await this.createUser(tripRequestDetails.rider, payload.team.id);
        request.riderId = passenger.id;
      }
      return request;
    } catch (error) {
      throw error;
    }
  }

  static async createTripRequest(payload, respond, tripRequestDetails) {
    try {
      const tripRequest = await this.createRequest(payload, tripRequestDetails);
      const trip = await TripRequest.create(tripRequest);

      InteractivePrompts.sendCompletionResponse(payload, respond, tripRequest.requestedById);
      SlackEvents.raise(slackEventsNames.NEW_TRIP_REQUEST, payload, trip.dataValues, respond);

      return true;
    } catch (error) {
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
      throw error;
    }
  }

  static async createUser(userId, teamId) {
    try {
      const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
      const userInfo = await UserInputValidator.fetchUserInformationFromSlack(userId, slackBotOauthToken);
      const { real_name, profile: { email } } = userInfo; //eslint-disable-line

      const [user] = await User.findOrCreate({
        where: { slackId: userId },
        defaults: { name: real_name, email }
      });
      return user.dataValues;
    } catch (error) {
      throw error;
    }
  }
}

export default ScheduleTripController;
