import moment from 'moment';
import { SlackInteractiveMessage, DialogPrompts } from '../../../RouteManagement/rootFile';
import { SlackDialogTextarea, SlackDialog } from '../../../SlackModels/SlackDialogModels';
import tripService from '../../../../../services/TripService';
import TripCompletionJob from '../../../../../services/jobScheduler/jobs/TripCompletionJob';
import RateTripController from '../../../TripManagement/RateTripController';
import CleanData from '../../../../../helpers/cleanData';

class TripInteractions {
  static tripCompleted(data, respond, trip) {
    const payload = CleanData.trim(data);
    const { actions: [{ name }] } = payload;

    switch (name) {
      case 'trip_taken':
        TripInteractions.hasCompletedTrip(payload, respond, trip);
        break;
      case 'not_taken':
        TripInteractions.hasNotTakenTrip(payload, respond);
        break;
      case 'still_on_trip':
        TripInteractions.isOnTrip(payload, respond);
        break;

      default:
        break;
    }
  }

  static async isOnTrip(data, respond) {
    const payload = CleanData.trim(data);
    const { actions: [{ value }] } = payload;
    await tripService.updateRequest(value, { tripStatus: 'InTransit' });
    const trip = await tripService.getById(value);
    const scheduleSpan = process.env.NODE_ENV === 'development' ? 'minutes' : 'hours';
    const newScheduleTime = moment(new Date()).add(1, scheduleSpan).format();
    TripCompletionJob.createScheduleForATrip(trip, newScheduleTime, 0);
    respond(new SlackInteractiveMessage('Okay! We\'ll check later.'));
  }

  static async hasCompletedTrip(data, respond) {
    const payload = CleanData.trim(data);
    const { actions: [{ value }] } = payload;
    await tripService.updateRequest(value, { tripStatus: 'Completed' });
    const ratingMessage = await RateTripController.sendRatingMessage(value, 'rate_trip');
    respond(ratingMessage);
  }

  static async hasNotTakenTrip(data) {
    const payload = CleanData.trim(data);
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

  static async reasonForNotTakingTrip(data, respond) {
    const payload = CleanData.trim(data);
    const { submission } = payload;
    await tripService.updateRequest(payload.state, submission);
    respond(new SlackInteractiveMessage('Noted...'));
  }
}
export default TripInteractions;
