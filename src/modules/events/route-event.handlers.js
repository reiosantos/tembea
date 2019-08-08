import appEvents from './app-event.service';
import { routeEvents } from './route-events.constants';
import RouteService from '../../services/RouteService';
import RouteHelper from '../../helpers/RouteHelper';
import RouteUseRecordService from '../../services/RouteUseRecordService';
import ConfirmRouteUseJob from '../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import TeamDetailsService from '../../services/TeamDetailsService';

export default class RouteEventHandlers {
  constructor() {
    // TODO: subscribe to all events here
    this.subscriptions = [];
    this.subscriptions.push([
      appEvents.subscribe(routeEvents.takeOffAlert, RouteEventHandlers.sendTakeOffAlerts),
      appEvents.subscribe(routeEvents.completionNotification,
        RouteEventHandlers.sendCompletionNotification),
    ]);
  }

  static get teamUrl() {
    return process.env.NODE_ENV.toLowerCase() === 'production'
      ? 'andela.slack.com' : 'andela-tembea.slack.com';
  }

  static async sendTakeOffAlerts({ batchId }) {
    // TODO: get batch with all the riders
    try {
      const batchWithRiders = await RouteService.getRouteBatchByPk(batchId, true);
      if (batchWithRiders.riders && batchWithRiders.riders.length > 0) {
        const record = await RouteUseRecordService.create(batchId);
        const { botToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(
          RouteEventHandlers.teamUrl
        );

        const { riders, takeOff, name } = batchWithRiders;
        await Promise.all(riders.map(rider => RouteHelper.sendTakeOffReminder(rider,
          name, takeOff, botToken)));
        ConfirmRouteUseJob.scheduleTripCompletionNotification({
          takeOff, recordId: record.id, botToken
        });
      }
    } catch (_) {
      console.log(_);
    }
  }

  static async sendCompletionNotification({ recordId }) {
    const { botToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(
      RouteEventHandlers.teamUrl
    );
    const record = await RouteUseRecordService.getByPk(recordId, true);
    if (record && record.batch && record.batch.riders && record.batch.riders.length > 0) {
      const { riders, takeOff, name } = record.batch;
      await Promise.all(riders.map(rider => RouteHelper.sendCompletionNotification(rider,
        name, takeOff, record.id, botToken)));
    }
  }
}
