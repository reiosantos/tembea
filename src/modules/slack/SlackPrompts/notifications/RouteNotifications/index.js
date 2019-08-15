import SlackNotifications from '../../Notifications';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import BugsnagHelper from '../../../../../helpers/bugsnagHelper';
import UserService from '../../../../../services/UserService';
import RouteService from '../../../../../services/RouteService';
import {
  SlackAttachmentField, SlackAttachment, SlackButtonAction
} from '../../../SlackModels/SlackMessageModels';
import RouteServiceHelper from '../../../../../helpers/RouteServiceHelper';
import ProviderAttachmentHelper from '../ProviderNotifications/helper';

export default class RouteNotifications {
  static async sendRouteNotificationToRouteRiders(teamUrl, routeInfo) {
    const {
      riders, route: { destination: { address } }, status, deleted
    } = routeInfo;
    const { botToken: teamBotOauthToken } = await TeamDetailsService
      .getTeamDetailsByTeamUrl(teamUrl);
    const isDeactivation = (status && status.toLowerCase() === 'inactive') || deleted;
    const updatedDetails = routeInfo && await RouteServiceHelper.serializeRouteBatch(routeInfo);
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

  static async sendRouteUseConfirmationNotificationToRider({
    record, rider
  }, botToken) {
    try {
      const channelID = await SlackNotifications.getDMChannelId(rider.slackId, botToken);

      const actions = [
        new SlackButtonAction('taken', 'Yes', `${record.id}`),
        new SlackButtonAction('still_on_trip', 'Still on trip', `${record.id}`),
        new SlackButtonAction('not_taken', 'No', `${record.id}`, 'danger')];
      const attachment = new SlackAttachment('', '', '', '', '');
      const routeBatch = await RouteService.getRouteBatchByPk(record.batch.id, true);
      const fields = RouteNotifications.createDetailsFields(routeBatch);
      attachment.addFieldsOrActions('actions', actions);
      attachment.addFieldsOrActions('fields', fields);
      attachment.addOptionalProps('confirm_route_use');
      const message = SlackNotifications.createDirectMessage(channelID,
        `Hi! <@${rider.slackId}> Did you take the trip on route ${routeBatch.route.name}?`,
        attachment);
      return SlackNotifications.sendNotification(message, botToken);
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  /**
      * Sends notification to the manager
      * when a fellow request for a new route have been approved.
      * @return {Promise<*>}
      * @param routeRequest
      * @param slackBotOauthToken
      * @param submission
      */
  static async sendRouteApproveMessageToManager(
    routeRequest, slackBotOauthToken, requestData
  ) {
    try {
      const channelID = await SlackNotifications.getDMChannelId(
        routeRequest.manager.slackId, slackBotOauthToken
      );
      const message = await ProviderAttachmentHelper.getManagerApproveAttachment(
        routeRequest, channelID, true, requestData
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  /**
        * This function sends a notification to the fellow
        * when the providers team approves the route request
        * @return {Promise<*>}
        * @param routeRequest
        * @param slackBotOauthToken
        * @param submission
        * @param teamUrl
        */
  static async sendRouteApproveMessageToFellow(
    routeRequest, slackBotOauthToken, requestData
  ) {
    try {
      const { fellow } = routeRequest.engagement;
      const channelID = await SlackNotifications.getDMChannelId(
        fellow.slackId, slackBotOauthToken
      );
      const message = await ProviderAttachmentHelper.getFellowApproveAttachment(
        routeRequest, channelID, requestData
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  static async getReminderMessage(channelID, { rider, batch: routeBatch }) {
    const reminderAttachment = new SlackAttachment('Trip Reminder');
    const routeInfoFields = RouteNotifications.createDetailsFields(routeBatch);
    reminderAttachment.addFieldsOrActions('fields', routeInfoFields);
    return SlackNotifications.createDirectMessage(
      channelID,
      `Hey, <@${rider.slackId}>, you have an upcoming trip on route ${routeBatch.route.name}`,
      reminderAttachment
    );
  }

  static async sendRouteTripReminder({ rider, batch }, slackBotOauthToken) {
    try {
      const channelID = await SlackNotifications.getDMChannelId(
        rider.slackId, slackBotOauthToken
      );

      const message = await RouteNotifications.getReminderMessage(channelID,
        { rider, batch });

      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  static createDetailsFields(routeBatch) {
    return [
      new SlackAttachmentField('Batch', routeBatch.batch, true),
      new SlackAttachmentField('Took Off At', routeBatch.takeOff, true),
      new SlackAttachmentField('Cab Reg No', routeBatch.cabDetails.regNumber, true),
      new SlackAttachmentField('Driver Name', routeBatch.cabDetails.driverName, true),
      new SlackAttachmentField('Driver Phone Number', routeBatch.cabDetails.driverPhoneNo, true)
    ];
  }
}
