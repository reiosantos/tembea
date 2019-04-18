import TripItineraryHelper from '../helpers/slackHelpers/TripItineraryHelper';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import SlackPagination from '../../../helpers/slack/SlackPaginationHelper';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import { TRIP_LIST_TYPE } from '../../../helpers/constants';

export const responseMessage = (
  text = 'You have no trip history'
) => new SlackInteractiveMessage(text);


export const getPageNumber = (payload) => {
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

export const triggerPage = (payload, respond) => {
  const { actions: [{ value: requestType }], callback_id: callbackId } = payload;
  if (payload.actions && payload.actions[0].name === 'skipPage') {
    respond(new SlackInteractiveMessage('Noted...'));
    return DialogPrompts.sendSkipPage(payload, requestType, callbackId);
  }
  if (payload.actions && payload.actions[0].name === 'search') {
    return DialogPrompts.sendSearchPage(payload, requestType, callbackId, respond);
  }
};

class TripItineraryController {
  static async handleTripHistory(payload, respond) {
    try {
      const { user: { id: slackId }, team: { id: teamId } } = payload;
      await SlackHelpers.findOrCreateUserBySlackId(slackId, teamId);
      const pageNumber = getPageNumber(payload);
      const tripsPayload = await TripItineraryHelper.getPaginatedTripRequestsBySlackUserId(
        slackId, TRIP_LIST_TYPE.PAST, pageNumber
      );

      if (!tripsPayload) {
        return respond(responseMessage('Could not get trip history'));
      }
      const {
        data: trips,
        pageMeta: {
          totalPages,
          pageNo
        }
      } = tripsPayload;

      if (!trips.length) {
        return respond(responseMessage());
      }

      triggerPage(payload, respond);
      return InteractivePrompts.sendTripHistory(trips, totalPages, pageNo, payload, respond);
    } catch (error) {
      respond(responseMessage(`Could not be processed! ${error.message}`));
    }
  }

  static async handleUpcomingTrips(payload, respond) {
    try {
      const { user: { id: slackId }, team: { id: teamId } } = payload;
      await SlackHelpers.findOrCreateUserBySlackId(slackId, teamId);
      const pageNumber = getPageNumber(payload);
      const tripsPayload = await TripItineraryHelper.getPaginatedTripRequestsBySlackUserId(
        slackId, TRIP_LIST_TYPE.UPCOMING, pageNumber
      );
      if (!tripsPayload) {
        return respond(responseMessage('Something went wrong getting trips'));
      }

      const {
        data: trips,
        pageMeta: {
          totalPages,
          pageNo: page
        }
      } = tripsPayload;

      if (!trips.length) {
        return respond(responseMessage('You have no upcoming trips'));
      }

      triggerPage(payload, respond);

      return InteractivePrompts.sendUpcomingTrips(trips, totalPages, page, payload, respond);
    } catch (error) {
      respond(responseMessage(`Could not be processed! ${error.message}`));
    }
  }
}

export default TripItineraryController;
