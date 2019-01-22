import TripItineraryHelper from '../helpers/slackHelpers/TripItineraryHelper';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import SlackPagination from '../../../helpers/slack/SlackPaginationHelper';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import SlackHelpers from '../../../helpers/slack/slackHelpers';

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

export const triggerSkipPage = (payload, respond) => {
  if (payload.actions && payload.actions[0].name === 'skipPage') {
    const { value: requestType } = payload.actions[0];
    respond(new SlackInteractiveMessage('Noted...'));
    return DialogPrompts.sendSkipPage(payload, requestType);
  }
};

class TripItineraryController {
  static async handleTripHistory(payload, respond) {
    try {
      const { user: { id: slackId }, team: { id: teamId } } = payload;
      await SlackHelpers.findOrCreateUserBySlackId(slackId, teamId);
      const pageNumber = getPageNumber(payload);
      const requestType = 'history';
      const tripsPayload = await TripItineraryHelper.getPaginatedTripRequestsBySlackUserId(
        slackId, requestType,
      );

      if (!tripsPayload) {
        return respond(responseMessage('Could not get trip history'));
      }
      const [page, totalPages] = await Promise.all([
        tripsPayload.getPageNo(pageNumber), tripsPayload.getTotalPages()]);
      const trips = await tripsPayload.getPageItems(page);

      if (!trips.length) {
        return respond(responseMessage());
      }

      triggerSkipPage(payload, respond);

      return InteractivePrompts.sendTripHistory(trips, totalPages, page, payload, respond);
    } catch (error) {
      respond(responseMessage(`Could not be processed! ${error.message}`));
    }
  }

  static async handleUpcomingTrips(payload, respond) {
    try {
      const { user: { id: slackId }, team: { id: teamId } } = payload;

      await SlackHelpers.findOrCreateUserBySlackId(slackId, teamId);
      const pageNumber = getPageNumber(payload);
      const requestType = 'upcoming';
      const tripsPayload = await TripItineraryHelper.getPaginatedTripRequestsBySlackUserId(
        slackId, requestType,
      );
      if (!tripsPayload) {
        return respond(responseMessage('Something went wrong getting trips'));
      }


      const [page, totalPages] = await Promise.all([
        tripsPayload.getPageNo(pageNumber), tripsPayload.getTotalPages()]);
      const trips = await tripsPayload.getPageItems(page);

      if (!trips.length) {
        return respond(responseMessage('You have no upcoming trips'));
      }

      triggerSkipPage(payload, respond);

      return InteractivePrompts.sendUpcomingTrips(trips, totalPages, page, payload, respond);
    } catch (error) {
      respond(responseMessage(`Could not be processed! ${error.message}`));
    }
  }
}

export default TripItineraryController;
