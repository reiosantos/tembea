import appEvents from './app-event.service';
import { routeEvents } from './route-events.constants';
import RouteService from '../../services/RouteService';
import RouteHelper from '../../helpers/RouteHelper';
import RouteUseRecordService from '../../services/RouteUseRecordService';
import ConfirmRouteUseJob from '../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import TeamDetailsService from '../../services/TeamDetailsService';
import { bugsnagHelper } from '../slack/RouteManagement/rootFile';
import RouteNotifications from '../slack/SlackPrompts/notifications/RouteNotifications';
import HomebaseService from '../../services/HomebaseService';

export default class RouteEventHandlers {
  static init() {
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
    try {
      const batchWithRiders = await RouteService.getRouteBatchByPk(batchId, true);
      if (batchWithRiders.riders && batchWithRiders.riders.length > 0) {
        const record = await RouteUseRecordService.create(batchId);
        const { botToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(
          RouteEventHandlers.teamUrl
        );

        const { riders, takeOff } = batchWithRiders;
        await Promise.all(riders.map((rider) => RouteHelper.sendTakeOffReminder(rider,
          batchWithRiders, botToken)));
        ConfirmRouteUseJob.scheduleTripCompletionNotification({
          recordId: record.id, takeOff, botToken
        });
      }
    } catch (_) {
      bugsnagHelper.log(_);
    }
  }

  static async sendCompletionNotification({ recordId, botToken }) {
    const record = await RouteUseRecordService.getByPk(recordId, true);
    if (record && record.batch && record.batch.riders && record.batch.riders.length > 0) {
      const { riders } = record.batch;
      await Promise.all(riders.map((rider) => RouteHelper.sendCompletionNotification(rider,
        record, botToken)));
    }
  }

  static async handleUserLeavesRouteNotification(payload, userName, routeName, riders) {
    const {
      user: { id: slackId }
    } = payload;

    const { channel: channelId } = await HomebaseService.getHomeBaseBySlackId(slackId);
    await RouteNotifications.sendUserLeavesRouteMessage(
      channelId,
      payload,
      userName,
      { routeName, riders }
    );
  }
}
