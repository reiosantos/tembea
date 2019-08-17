import scheduler from 'node-schedule';
import moment from 'moment-timezone';
import RouteService from '../../RouteService';
import { routeSchedules, routeEvents } from '../../../modules/events/route-events.constants';
import appEvents from '../../../modules/events/app-event.service';

class ConfirmRouteUseJob {
  static async autoStartRouteJob() {
    const timeFromServerStart = moment.tz(new Date(), 'MM/DD/YYYY HH:mm', 'Africa/Nairobi')
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
    scheduler.scheduleJob('daily job', rule, ConfirmRouteUseJob.schedulePreTripNotification);
  }

  static async schedulePreTripNotification() {
    const batches = await RouteService.getBatches({ status: 'Active' });
    if (batches.length < 1) return;
    batches.map(ConfirmRouteUseJob.scheduleTakeOffReminders);
  }

  static async scheduleTakeOffReminders(routeBatch) {
    const allowance = process.env.NODE_ENV === 'production' ? { minutes: -15 } : { minutes: -1 };
    const time = ConfirmRouteUseJob.getTodayTime(routeBatch.takeOff, allowance);
    scheduler.scheduleJob(
      `${routeSchedules.takeOffReminder}__${routeBatch.id}`,
      time,
      () => {
        appEvents.broadcast(
          {
            name: routeEvents.takeOffAlert,
            data: {
              batchId: routeBatch.id,
            }
          }
        );
      }
    );
  }

  static scheduleTripCompletionNotification({ recordId, takeOff, botToken }) {
    const allowance = process.env.NODE_ENV === 'production' ? { hours: 2 } : { minutes: 1 };
    const time = ConfirmRouteUseJob.getTodayTime(takeOff, allowance);
    scheduler.scheduleJob(
      `${routeSchedules.completionNotification}__${recordId}`,
      time,
      () => appEvents.broadcast({
        name: routeEvents.completionNotification,
        data: { recordId, botToken }
      })
    );
  }

  static getTodayTime(time, { hours = 0, minutes = 0, seconds = 0 }, tz = 'Africa/Nairobi') {
    const date = moment(new Date(), 'MM/DD/YYYY')
      .format('MM/DD/YYYY');
    const timeAdded = {
      hours,
      minutes,
      seconds
    };
    return moment.tz(`${date} ${time}`, 'MM/DD/YYYY HH:mm', tz)
      .add(timeAdded)
      .format();
  }
}

export default ConfirmRouteUseJob;
