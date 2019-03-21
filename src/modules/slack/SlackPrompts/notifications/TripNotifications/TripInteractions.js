import moment from 'moment';
import { SlackInteractiveMessage, DialogPrompts } from '../../../RouteManagement/rootFile';
import { SlackAttachment, SlackButtonAction } from '../../../SlackModels/SlackMessageModels';
import { SlackDialogTextarea, SlackDialog } from '../../../SlackModels/SlackDialogModels';
import tripService from '../../../../../services/TripService';
import TripCompletionJob from '../../../../../services/jobScheduler/jobs/TripCompletionJob';
import RateTripController from '../../../TripManagement/RateTripController';

class TripInteractions {
  static tripCompleted(payload, respond, trip) {
    const { actions: [{ name }] } = payload;

    switch (name) {
      case 'taken':
        TripInteractions.hasTakenTrip(payload, respond, trip);
        break;
      case 'not_taken':
        TripInteractions.hasNotTakenTrip(payload, respond);
        break;
      case 'completed':
        TripInteractions.hasCompletedTrip(payload, respond);
        break;
      case 'not_completed':
        TripInteractions.hasNotCompletedTrip(payload, respond);
        break;

      default:
        break;
    }
  }

  static async hasTakenTrip(payload, respond) {
    const { actions: [{ value }] } = payload;
    await tripService.updateRequest(value, { tripStatus: 'InTransit' });
    const actions = [new SlackButtonAction('completed', 'Yes', value),
      new SlackButtonAction('not_completed', 'No', value, 'danger')];
    const attachment = new SlackAttachment('', '', '', '', '');
    attachment.addFieldsOrActions('actions', actions);
    attachment.addOptionalProps('trip_completion');
    respond(new SlackInteractiveMessage('Did you complete the trip ?', [attachment]));
  }

  static async hasCompletedTrip(payload, respond) {
    const { actions: [{ value }] } = payload;
    await tripService.updateRequest(value, { tripStatus: 'Completed' });
    const ratingMessage = await RateTripController.sendRatingMessage(value, 'rate_trip');
    respond(ratingMessage);
  }

  static async hasNotCompletedTrip(payload, respond) {
    const { actions: [{ value }] } = payload;
    const trip = await tripService.getById(value);
    const newScheduleTime = moment(new Date()).add(1, 'hours').format();
    TripCompletionJob.createScheduleForATrip(trip, newScheduleTime, 0);
    respond(new SlackInteractiveMessage('Okay! We\'ll check later.'));
  }

  static async hasNotTakenTrip(payload, respond) {
    respond(new SlackInteractiveMessage('Noted...'));
    const { actions: [{ value }] } = payload;
    await tripService.updateRequest(value, { tripStatus: 'Cancelled' });
    const dialog = new SlackDialog(
      'trip_not_taken', 'Reason', 'Submit', true, value
    );
    const textarea = new SlackDialogTextarea(
      'Reason', 'tripNotTakenReason', 'Reason for not taking trip'
    );
    dialog.addElements([textarea]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async resonForNotTakingTrip(payload, respond) {
    const { submission } = payload;
    await tripService.updateRequest(payload.state, submission);
    respond(new SlackInteractiveMessage('Noted...'));
  }
}
export default TripInteractions;
