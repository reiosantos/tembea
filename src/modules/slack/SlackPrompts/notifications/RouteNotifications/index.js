import SlackNotifications from '../../Notifications';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import BugsnagHelper from '../../../../../helpers/bugsnagHelper';
import UserService from '../../../../../services/UserService';
import RouteService from '../../../../../services/RouteService';
import { SlackAttachmentField, SlackAttachment, SlackButtonAction } from '../../../SlackModels/SlackMessageModels';
import RemoveDataValues from '../../../../../helpers/removeDataValues';
import { bugsnagHelper } from '../../../RouteManagement/rootFile';
import RouteServiceHelper from '../../../../../helpers/RouteServiceHelper';

class RouteNotifications {
  static async sendRouteNotificationToRouteRiders(teamUrl, routeInfo) {
    const {
      riders, route: { destination: { address } }, status, deleted
    } = routeInfo;
    const { botToken: teamBotOauthToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    const isDeactivation = (status && status.toLowerCase() === 'inactive') || deleted;
    const details = await RouteService.getRouteBatchByPk(routeInfo.id);
    const updatedDetails = details && await RouteServiceHelper.serializeRouteBatch(details);
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

  static async sendRouteUseConfirmationNotificationToRider(batchUseRecord) {
    try {
      const slackBotOauthToken = process.env.SLACK_BOT_OAUTH_TOKEN;
      const channelID = await SlackNotifications.getDMChannelId(batchUseRecord.user.slackId, slackBotOauthToken);
      const batchUseRecordString = JSON.stringify(batchUseRecord);
      const actions = [
        new SlackButtonAction('taken', 'Yes', batchUseRecordString),
        new SlackButtonAction('still_on_trip', 'Still on trip', batchUseRecordString),
        new SlackButtonAction('not_taken', 'No', batchUseRecordString, 'danger')];
      const attachment = new SlackAttachment('', '', '', '', '');
      const routeBatch = RemoveDataValues.removeDataValues(await RouteService.getRouteBatchByPk(batchUseRecord.routeUseRecord.batch.batchId));
      const fields = [
        new SlackAttachmentField('Batch', routeBatch.batch, true),
        new SlackAttachmentField('Took Off At', routeBatch.takeOff, true),
        new SlackAttachmentField('Cab Reg No', routeBatch.cabDetails.regNumber, true),
        new SlackAttachmentField('Driver Name', routeBatch.cabDetails.driverName, true),
        new SlackAttachmentField('Driver Phone Number', routeBatch.cabDetails.driverPhoneNo, true)];
      attachment.addFieldsOrActions('actions', actions);
      attachment.addFieldsOrActions('fields', fields);
      attachment.addOptionalProps('confirm_route_use');
      const message = SlackNotifications.createDirectMessage(channelID, `Hi! <@${batchUseRecord.user.slackId}> Did you take the trip for route ${routeBatch.route.name}?`, attachment);
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}

export default RouteNotifications;
