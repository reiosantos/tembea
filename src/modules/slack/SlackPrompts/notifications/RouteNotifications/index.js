import SlackNotifications from '../../Notifications';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import BugsnagHelper from '../../../../../helpers/bugsnagHelper';
import UserService from '../../../../../services/UserService';
import RouteService from '../../../../../services/RouteService';
import { SlackAttachmentField, SlackAttachment } from '../../../SlackModels/SlackMessageModels';

class RouteNotifications {
  static async sendRouteNotificationToRouteRiders(teamUrl, routeInfo) {
    const {
      riders, route: { destination: { address } }, status, deleted
    } = routeInfo;
    const { botToken: teamBotOauthToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    const isDeactivation = (status && status.toLowerCase() === 'inactive') || deleted;
    const details = await RouteService.getRouteBatchByPk(routeInfo.id);
    const updatedDetails = details && await RouteService.serializeRouteBatch(details);
    const text = isDeactivation
      ? `Sorry, Your route to *${address}* is no longer available :disappointed:`
      : `Your route to *${address}* has been updated.`;
    
    const message = await SlackNotifications.createDirectMessage(
      '',
      text,
      !isDeactivation && RouteNotifications.generateRouteUpdateAttachement(updatedDetails)
    );
    RouteNotifications.nofityRouteUsers(riders, message, isDeactivation, teamBotOauthToken);
  }

  static generateRouteUpdateAttachement(updatedDetails) {
    const {
      takeOff, name, destination, driverName, driverPhoneNo
    } = updatedDetails;
    const updateMessageAttachment = new SlackAttachment('Updated Route Details');
    updateMessageAttachment.addOptionalProps('', '', '#3c58d7');
    updateMessageAttachment.addFieldsOrActions('fields', [
      new SlackAttachmentField('Take Off Time', takeOff, true),
      new SlackAttachmentField('Route Name', name, true),
      new SlackAttachmentField('Destination', destination, true),
      new SlackAttachmentField('Driver\'s name', driverName, true),
      new SlackAttachmentField('Driver\'s Phone Number', driverPhoneNo, true),
    ]);
    return updateMessageAttachment;
  }

  static async nofityRouteUsers(riders, message, isDeactivation = false, botToken) {
    try {
      riders.forEach(async (rider) => {
        if (isDeactivation) {
          const theRider = await UserService.getUserById(rider.id);
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
