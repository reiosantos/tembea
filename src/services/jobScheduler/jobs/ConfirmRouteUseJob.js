import scheduler from 'node-schedule';
import moment from 'moment';
import RouteService from '../../RouteService';
import RouteUseRecordService from '../../RouteUseRecordService';
import BatchUseRecordService from '../../BatchUseRecordService';
import { slackEventNames, SlackEvents } from '../../../modules/slack/events/slackEvents';

class ConfirmRouteUseJob {
  static async confirmRouteBatchUseNotification(batchUseRecord) {
    const eventArgs = [
      slackEventNames.RIDERS_CONFIRM_ROUTE_USE,
      batchUseRecord
    ];
    SlackEvents.raise(...eventArgs);
    return 'done';
  }

  static async autoStartRouteJob() {
    const rule = new scheduler.RecurrenceRule();
    rule.dayOfWeek = [new scheduler.Range(1, 5)];
    if (process.env.NODE_ENV === 'production') {
      rule.minute = 1;
    } else {
      rule.second = 1;
    }
    const timeFromServerStart = moment(new Date(), 'MM/DD/YYYY HH:mm', 'Africa/Nairobi')
      .add({ hours: 0, minutes: 0, seconds: 10 }).format();
    scheduler.scheduleJob('start', timeFromServerStart, async () => {
      ConfirmRouteUseJob.scheduleAllRoutes();
      scheduler.scheduleJob('daily job', rule, async () => {
        Object.keys(scheduler.scheduledJobs).map((res) => {
          if (res.includes('batch job')) {
            const job = scheduler.scheduledJobs[res];
            scheduler.cancelJob(job);
          }
          return '';
        });
        ConfirmRouteUseJob.scheduleAllRoutes();
      });
    });
  }

  static async scheduleAllRoutes() {
    const { routes } = await RouteService.getRoutes(RouteService.defaultPageable, { status: 'Active' });
    routes.map(async (routeBatch) => {
      await ConfirmRouteUseJob.scheduleBatchStartJob(routeBatch);
    });
  }

  static async scheduleBatchStartJob(routeBatch) {
    const res = await RouteUseRecordService.createRouteUseRecord(routeBatch.id);
    if (res) {
      const time = ConfirmRouteUseJob.getTodayTime(routeBatch.takeOff);
      scheduler.scheduleJob(`batch job ${routeBatch.id}${new Date().getMilliseconds().toString()}`, time, async () => {
        const { data } = await BatchUseRecordService.getBatchUseRecord(undefined, { batchRecordId: res.id });
        data.map(async (batchUseRecord) => {
          ConfirmRouteUseJob.confirmRouteBatchUseNotification(batchUseRecord);
        });
      });
    }
  }

  static getTodayTime(time) {
    const date = moment(new Date(), 'MM/DD/YYYY').format('MM/DD/YYYY');
    let timeAdded = { hours: 0, minutes: 0, seconds: 10 };
    if (process.env.NODE_ENV === 'production') {
      timeAdded = { hours: 2, minutes: 0, seconds: 10 };
    }
    return moment(`${date} ${time}`, 'MM/DD/YYYY HH:mm', 'Africa/Nairobi')
      .add(timeAdded).format();
  }
}

export default ConfirmRouteUseJob;
