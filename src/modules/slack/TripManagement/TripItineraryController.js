import TripItineraryHelper from '../helpers/slackHelpers/TripItineraryHelper';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import slackHelpers from '../../../helpers/slack/slackHelpers';
import SlackPagination from '../../../helpers/slack/SlackPaginationHelper';
import DialogPrompts from '../SlackPrompts/DialogPrompts';

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
    trip => getDateTime(trip.departureTime) >= difference && getDateTime(trip.departureTime) <= date
  );
  return filteredTrips;
};

const getUserAndTripsRequest = async (slackId, requestType) => {
  const user = await slackHelpers.getUserBySlackId(slackId);
  if (!user) {
    return false;
  }
  const userId = user.id;

  const trips = await TripItineraryHelper.getTripRequests(userId, requestType);
  return trips;
};

const getPageNumber = (payload) => {
  let pageNumber;

  if (payload.submission) {
    ({ pageNumber } = payload.submission);
  }

  if (payload.actions) {
    const tempPageNo = SlackPagination.getPageNumber(payload.actions[0].name);
    pageNumber = tempPageNo || 1;
  }

  return pageNumber;
};

const triggerSkipPage = (payload, respond) => {
  if (payload.actions && payload.actions[0].name === 'skipPage') {
    respond(new SlackInteractiveMessage('Noted...'));
    return DialogPrompts.sendSkipPage(payload, 'view_upcoming_trips');
  }
};

class TripItineraryController {
  static async handleTripHistory(payload, respond) {
    const slackId = payload.user.id;
    try {
      const requestType = 'history';
      const trips = await getUserAndTripsRequest(slackId, requestType);
      if (!trips || trips.length < 1) {
        respond(tripResponse());
      }

      const tripHistory = await filterTripHistory(trips);
      if (tripHistory.length < 1) {
        respond(tripResponse('You have no trip history for the last 30 days'));
        return;
      }
      return InteractivePrompts.sendTripHistory(tripHistory, respond);
    } catch (error) {
      const message = new SlackInteractiveMessage(
        `Request could not be processed! ${error.message}`
      );
      respond(message);
    }
  }

  static async handleUpcomingTrips(payload, respond) {
    const slackId = payload.user.id;
    try {
      const pageNumber = getPageNumber(payload);
      const requestType = 'upcoming';
      const tripsPayload = await TripItineraryHelper.getPaginatedTripRequestsBySlackUserId(
        slackId, requestType
      );
      
      if (!tripsPayload) {
        throw new Error('Something went wrong getting trips');
      }

      const page = await tripsPayload.getPageNo(pageNumber);
      const totalPages = await tripsPayload.getTotalPages();
      const trips = await tripsPayload.getPageItems(page);
      
      if (!Array.isArray(trips) || !trips.length) {
        respond(tripResponse('You have no upcoming trips'));
        return;
      }

      triggerSkipPage(payload, respond);
      
      return InteractivePrompts.sendUpcomingTrips(trips, totalPages, page, respond, payload);
    } catch (error) {
      const message = new SlackInteractiveMessage(
        `Request could not be processed! ${error.message}`
      );
      respond(message);
    }
  }
}

export default TripItineraryController;
