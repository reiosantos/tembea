import TripItineraryController from '../../TripManagement/TripItineraryController';
import { SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import slackHelpers from '../../../../helpers/slack/slackHelpers';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';

const getDateTime = value => new Date(value).getTime();

const currentDate = () => new Date().getTime();

export const tripResponse = (
  text = 'You have no trip history'
) => new SlackInteractiveMessage(text);

/**
 * @description this function filters tripsRequests by the currentDate and
 * returns the trips have been taken for the last 30days
 * @param trips - [array]
 * @returns filteredTrips [array]
 */
const filterTripHistory = (trips) => {
  const thirtyDaysInMilliseconds = 2592000000;
  const date = currentDate();
  const difference = date - thirtyDaysInMilliseconds;

  return trips.filter(
    trip => getDateTime(trip.departureTime) >= difference && getDateTime(trip.departureTime) <= date
  );
};

const filterUpcomingTrips = trips => trips.filter(trip => getDateTime(trip.departureTime) >= currentDate());

const getUserAndTripsRequest = async (slackId, requestType) => {
  const user = await slackHelpers.getUserBySlackId(slackId);
  if (!user) {
    return false;
  }
  const userId = user.id;

  return TripItineraryController.getTripRequests(userId, requestType);
};

class TripItineraryHelper {
  static async handleTripHistory(payload, respond) {
    const slackId = payload.user.id;

    try {
      const requestType = 'history';
      const trips = await getUserAndTripsRequest(slackId, requestType);
      if (!trips || trips.length < 1) {
        respond(tripResponse());
        return;
      }

      const tripHistory = await filterTripHistory(trips);
      if (tripHistory.length < 1) {
        respond(tripResponse('You have no trip history for the last 30 days'));
        return;
      }
      return InteractivePrompts.sendTripHistory(tripHistory, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      const message = new SlackInteractiveMessage(
        `Request could not be processed! ${error.message}`
      );
      respond(message);
    }
  }

  static async handleUpcomingTrips(payload, respond) {
    const slackId = payload.user.id;

    try {
      const requestType = 'upcoming';
      const trips = await getUserAndTripsRequest(slackId, requestType);
      if (!trips || trips.length < 1) {
        respond(tripResponse('You have no upcoming trips'));
        return;
      }

      const tripHistory = await filterUpcomingTrips(trips);
      if (tripHistory.length < 1) {
        respond(tripResponse('You have no upcoming trips'));
        return;
      }
      return InteractivePrompts.sendUpcomingTrips(trips, respond, payload);
    } catch (error) {
      bugsnagHelper.log(error);
      const message = new SlackInteractiveMessage(
        `Request could not be processed! ${error.message}`
      );
      respond(message);
    }
  }
}

export default TripItineraryHelper;
