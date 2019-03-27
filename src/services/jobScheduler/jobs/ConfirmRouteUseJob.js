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
    rule.minute = 1;
    scheduler.scheduleJob(rule, async () => {
      ConfirmRouteUseJob.scheduleAllRoutes();
    });
  }

  static async scheduleAllRoutes() {
    const { routes } = await RouteService.getRoutes();
    routes.map(async (routeBatch) => {
      await ConfirmRouteUseJob.scheduleBatchStartJob(routeBatch);
    });
  }

  static async scheduleBatchStartJob(routeBatch) {
    const res = await RouteUseRecordService.createRouteUseRecord(routeBatch.id);
    if (res) {
      const time = ConfirmRouteUseJob.getTodayTime(routeBatch.takeOff);
      scheduler.scheduleJob(time, async () => {
        const { data } = await BatchUseRecordService.getBatchUseRecord(undefined, { batchRecordId: res.id });
        data.map(async (batchUseRecord) => {
          ConfirmRouteUseJob.confirmRouteBatchUseNotification(batchUseRecord);
        });
      });
    }
  }

  static getTodayTime(time) {
    const date = moment(new Date(), 'MM/DD/YYYY').format('MM/DD/YYYY');
    return moment(`${date} ${time}`, 'MM/DD/YYYY HH:mm', 'Africa/Nairobi')
      .add({ hours: 2, minutes: 0, seconds: 0 }).format();
  }
}

export default ConfirmRouteUseJob;
