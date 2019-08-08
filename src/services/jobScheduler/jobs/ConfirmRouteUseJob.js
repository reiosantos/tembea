import scheduler from 'node-schedule';
import moment from 'moment';
import RouteService from '../../RouteService';
import { routeSchedules, routeEvents } from '../../../modules/events/route-events.constants';
import appEvents from '../../../modules/events/app-event.service';

class ConfirmRouteUseJob {
  static async autoStartRouteJob() {
    const timeFromServerStart = moment(new Date(), 'MM/DD/YYYY HH:mm', 'Africa/Nairobi')
      .add({ hours: 0, minutes: 0, seconds: 10 }).format();
    scheduler.scheduleJob('start', timeFromServerStart, ConfirmRouteUseJob.start);
  }

  static async start() {
    const rule = new scheduler.RecurrenceRule();
    rule.dayOfWeek = [new scheduler.Range(1, 5)];
    if (process.env.NODE_ENV === 'production') {
      rule.minute = 1;
    } else {
      rule.second = 1;
    }
    ConfirmRouteUseJob.schedulePreTripNotification();
    scheduler.scheduleJob('daily job', rule, ConfirmRouteUseJob.startTripReminderJobs);
  }

  static async startTripReminderJobs() {
    Object.keys(scheduler.scheduledJobs)
      .map(ConfirmRouteUseJob.registerTripReminderJob);
    ConfirmRouteUseJob.schedulePreTripNotification();
  }

  static async registerTripReminderJob(res) {
    if (res.includes(routeSchedules.takeOffReminder)) {
      const job = scheduler.scheduledJobs[res];
      scheduler.cancelJob(job);
    }
  }

  static async schedulePreTripNotification() {
    const batches = await RouteService.getBatches({ status: 'Active' });
    if (batches.length < 1) return;
    batches.map(ConfirmRouteUseJob.scheduleTakeOffReminders);
  }

  static async scheduleTakeOffReminders(routeBatch) {
    const allowance = process.env.NODE_ENV === 'production' ? { minute: -15 } : { minute: -5 };
    const time = ConfirmRouteUseJob.getTodayTime(routeBatch.takeOff, allowance);
    scheduler.scheduleJob(
      `${routeSchedules.takeOffReminder}__${routeBatch.id}`,
      time,
      () => appEvents.broadcast(
        routeEvents.takeOffAlert, {
          batchId: routeBatch.id,
        }
      )
    );
  }

  static scheduleTripCompletionNotification({ takeOff, recordId }) {
    scheduler.scheduleJob(
      `${routeSchedules.completionNotification}__${recordId}`,
      takeOff,
      () => appEvents.broadcast(routeEvents.completionNotification, { recordId })
    );
  }

  static getTodayTime(time, { hours = 0, minutes = 0, seconds = 0 }) {
    const date = moment(new Date(), 'MM/DD/YYYY')
      .format('MM/DD/YYYY');
    const timeAdded = {
      hours,
      minutes,
      seconds
    };
    return moment(`${date} ${time}`, 'MM/DD/YYYY HH:mm')
      .add(timeAdded)
      .format();
  }
}

export default ConfirmRouteUseJob;
