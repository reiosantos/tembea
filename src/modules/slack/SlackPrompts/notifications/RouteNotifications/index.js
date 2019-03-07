import SlackNotifications from '../../Notifications';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import BugsnagHelper from '../../../../../helpers/bugsnagHelper';
import UserService from '../../../../../services/UserService';


class RouteNotifications {
  static async sendRouteNotificationToRouteRiders(teamUrl, routeInfo) {
    const {
      riders, route: { destination: { address } }, status, deleted
    } = routeInfo;
    const { botToken: teamBotOauthToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    const isDeactivation = (status && status.toLowerCase() === 'inactive') || deleted;
    const text = isDeactivation
      ? `Sorry, Your route to *${address}* is no longer available :disappointed:`
      : `Your route to *${address}* has been updated.`;
    
    const message = await SlackNotifications.createDirectMessage('', text);
    RouteNotifications.nofityRouteUsers(riders, message, isDeactivation, teamBotOauthToken);
  }

  static async nofityRouteUsers(riders, message, isDeactivation = false, botToken) {
    try {
      riders.forEach(async (rider) => {
        const theRider = await UserService.getUserById(rider.id);
        if (isDeactivation) {
          theRider.routeBatchId = null;
          await theRider.save();
        }
        RouteNotifications.sendNotificationToRider(message, rider.slackId, botToken);
      });
    } catch (err) {
      BugsnagHelper.log(err);
    }
  }

  static async sendNotificationToRider(message, slackId, slackBotOauthToken) {
    const imId = await SlackNotifications.getDMChannelId(slackId, slackBotOauthToken);
    const response = { ...message, channel: imId };
    await SlackNotifications.sendNotification(response, slackBotOauthToken);
  }
}

export default RouteNotifications;
