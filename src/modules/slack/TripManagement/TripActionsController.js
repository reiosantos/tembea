import models from '../../../database/models';
import SendNotifications from '../SlackPrompts/Notifications';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';

const { TripRequest } = models;

class TripActionsController {
  static async changeTripStatus(payload, respond) {
    const state = JSON.parse(payload.state);
    const { id } = payload.user;
    const { comment } = payload.submission;
    const tripId = Number(state.trip);
    const declinedById = (await SlackHelpers.getUserBySlackId(id)).id;
    try {
      await TripRequest.update({
        tripStatus: 'DeclinedByOps',
        operationsComment: comment,
        declinedById
      }, { where: { id: tripId } });
      const trip = await SlackHelpers.getTripRequest(tripId);
      SendNotifications.sendUserNotification(payload, trip);
      SendNotifications.sendManagerNotification(payload, trip);
      InteractivePrompts.sendDeclineCompletion(trip, state.actionTs, payload.channel.id);
      
      return 'success';
    } catch (error) {
      respond({
        text: 'Dang, something went wrong there.'
      });
    }
  }
}

export default TripActionsController;
