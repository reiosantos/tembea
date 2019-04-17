import schedule from 'node-schedule';
import moment from 'moment';
import tripService from '../../TripService';
import { SlackEvents, slackEventNames } from '../../../modules/slack/events/slackEvents';
import RemoveDataValues from '../../../helpers/removeDataValues';

class TripCompletionJob {
  static async sendNotificationForConfirmedTrips() {
    const trips = await tripService.getAll({
      where: { tripStatus: 'Confirmed' || 'InTransit' }
    });
    const tripData = RemoveDataValues.removeDataValues(trips);
    if (tripData) {
      tripData.forEach((trip) => {
        TripCompletionJob.createScheduleForATrip(trip);
      });
    }
  }

  static calculateNotificationPrompTime(departureTime, defaultPromptTime) {
    if (process.env.NODE_ENV === 'development') {
      return moment(new Date(departureTime)).add(defaultPromptTime, 'seconds').format();
    }
    return moment(new Date(departureTime)).add(defaultPromptTime, 'hours').format();
  }

  static createScheduleForATrip(
    trip, rescheduleTime = null, notificationInterval = 2
  ) {
    const scheduleTime = TripCompletionJob.calculateNotificationPrompTime(
      rescheduleTime === null ? trip.departureTime : rescheduleTime, notificationInterval
    );
    schedule.scheduleJob(scheduleTime, () => {
      SlackEvents.raise(slackEventNames.TRIP_COMPLETION,
        trip);
    });
  }
}
export default TripCompletionJob;
