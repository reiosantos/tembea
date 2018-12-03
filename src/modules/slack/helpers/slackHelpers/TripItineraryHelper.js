import TripItineraryController from '../../TripManagement/TripItineraryController';
import { SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import slackHelpers from '../../../../helpers/slack/slackHelpers';

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

  const filteredTrips = trips.filter(
    trip => getDateTime(trip.departureTime) >= difference
      && getDateTime(trip.departureTime) <= date
  );

  return filteredTrips;
};

const getUserAndTripsRequest = async (slackId, requestType) => {
  const user = await slackHelpers.getUserBySlackId(slackId);
  if (!user) {
    return false;
  }
  const userId = user.id;

  const trips = await TripItineraryController.getTripRequests(userId, requestType);
  return trips;
};

class TripItineraryHelper {
  static async handleTripHistory(payload, respond) {
    const slackId = payload.user.id;

    try {
      const requestType = 'history';
      const trips = await getUserAndTripsRequest(slackId, requestType);
      if (!trips || trips.length < 1) {
        return respond(tripResponse());
      }

      const tripHistory = await filterTripHistory(trips);
      if (tripHistory.length < 1) {
        return respond(tripResponse('You have no trip history for the last 30 days'));
      }

      return InteractivePrompts.sendTripHistory(tripHistory, respond);
    } catch (error) {
      const message = new SlackInteractiveMessage(
        `Request could not be processed! ${error.message}`
      );
      respond(message);
    }
  }
}

export default TripItineraryHelper;
