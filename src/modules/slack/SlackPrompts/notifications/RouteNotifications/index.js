import SlackNotifications from '../../Notifications';
import TeamDetailsService from '../../../../../services/TeamDetailsService';

class RouteNotifications {
  static async sendRouteNotificationToRouteRiders(teamUrl, routeInfo, notifType) {
    const { riders, route: { destination: { address } } } = routeInfo;
    const { botToken: teamBotOauthToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    const text = notifType === 'route_deactivated'
      ? `Sorry, Your route to *${address}* is no longer available :disappointed:`
      : `Your route to *${address}* has been updated.`;
    const message = await SlackNotifications.createDirectMessage('', text);
    await riders.forEach(
      rider => RouteNotifications.sendNotificationToRider(message, rider.slackId, teamBotOauthToken)
    );
  }

  static async sendNotificationToRider(message, slackId, slackBotOauthToken) {
    const imId = await SlackNotifications.getDMChannelId(slackId, slackBotOauthToken);
    const response = { ...message, channel: imId };
    await SlackNotifications.sendNotification(response, slackBotOauthToken);
  }
}

export default RouteNotifications;
