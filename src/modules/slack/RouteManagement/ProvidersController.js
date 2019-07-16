import RouteRequestService from '../../../services/RouteRequestService';
import ProviderNotifications from '../SlackPrompts/notifications/ProviderNotifications/index';
import { SlackInteractiveMessage, SlackAttachment } from '../SlackModels/SlackMessageModels';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import RouteService from '../../../services/RouteService';
import ConfirmRouteUseJob from '../../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import SlackNotifications from '../SlackPrompts/Notifications';
import TeamDetailsService from '../../../services/TeamDetailsService';
import ProviderAttachmentHelper from '../SlackPrompts/notifications/ProviderNotifications/helper';
import { driverService } from '../../../services/DriverService';
import { cabService } from '../../../services/CabService';
import ProviderService from '../../../services/ProviderService';

class ProvidersController {
  static async saveRoute(updatedRequest, submission, userId) {
    const { busStop, routeImageUrl } = updatedRequest;
    const {
      routeName, routeCapacity, takeOffTime, regNumber, driverId
    } = submission;
    const data = {
      destinationName: busStop.address,
      imageUrl: routeImageUrl,
      name: routeName,
      capacity: routeCapacity,
      takeOff: takeOffTime,
      vehicleRegNumber: regNumber,
      driverId,
      status: 'Active',
    };
    const batch = await RouteService.createRouteBatch(data);
    await Promise.all([
      ConfirmRouteUseJob.scheduleBatchStartJob(batch),
      RouteService.addUserToRoute(batch.id, userId),
    ]);
  }

  static async getFinalCabSubmissionDetails(submission) {
    const [capacity, , regNumber] = submission.cab.split(',');
    const [id, driverName, driverPhoneNo, driverNumber] = submission.driver.split(',');
    return {
      regNumber,
      routeCapacity: capacity,
      driverName,
      driverPhoneNumber: driverPhoneNo,
      driverId: id,
      driverNumber
    };
  }

  static async handleProvidersRouteApproval(data, respond) {
    try {
      const { team: { id: teamId } } = data;
      const { tripId, channel, timeStamp } = JSON.parse(data.state);
      const routeRequestId = tripId.split('_')[2];
      const routeInfo = JSON.parse(tripId.split('_')[3]);
      let { submission } = data;
      submission = { ...submission, ...routeInfo };
      const { slackBotOauthToken, routeRequest } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, { status: 'Approved' });
      const cabDetails = await ProvidersController.getFinalCabSubmissionDetails(submission);
      submission = { ...submission, ...cabDetails };
      const { id } = updatedRequest.engagement.fellow;
      const save = ProvidersController.saveRoute(updatedRequest, submission, id);
      const complete = ProviderNotifications.completeProviderApprovedAction(
        updatedRequest, channel, teamId, timeStamp, slackBotOauthToken, submission, false
      );
      await Promise.all([complete, save]);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  // TODO: write test
  static async handleProviderRouteApproval(payload) {
    const {
      team: { id: teamId },
      submission: { driver: driverDetails, cab: cabDetails },
      state
    } = payload;
    const driverId = driverDetails.split(',')[0];
    const cabId = cabDetails.split(',')[0];
    const { tripId: routeBatchId, channel, timeStamp } = JSON.parse(state);
    const routeBatch = await RouteService.updateRouteBatch(routeBatchId, { driverId, cabId });
    const { cabDetails: { providerId }, route: { name: routeName }, riders } = routeBatch;
    const { name } = await ProviderService.findProviderByPk(providerId);
    const attachment = await ProvidersController.getMessageAttachment(routeBatch);
    const { botToken, opsChannelId } = await TeamDetailsService.getTeamDetails(teamId);
    if (routeBatch.riders[0]) {
      await ProvidersController.sendUserProviderAssignMessage(
        riders, botToken, routeName, attachment
      );
    }
    const opsNotification = ProvidersController.sendOpsProviderAssignMessage(
      name, routeName, botToken, opsChannelId, attachment
    );
    const updateNotification = ProviderNotifications.updateRouteApprovalNotification(
      channel, botToken, timeStamp, attachment
    );
    await Promise.all(opsNotification, updateNotification);
  }

  // TODO: write test
  static async sendOpsProviderAssignMessage(
    providerName, routeName, botToken, opsChannelId, attachment
  ) {
    const message = SlackNotifications.createDirectMessage(
      opsChannelId,
      `*${providerName}* has assigned a cab and a driver to route "*${routeName}*". :smiley:`,
      [attachment]
    );
    return SlackNotifications.sendNotification(message, botToken);
  }

  // TODO: write test
  static async sendUserProviderAssignMessage(riders, botToken, routeName, attachment) {
    const { slackId } = riders[0];
    const directMessageId = await SlackNotifications.getDMChannelId(
      slackId, botToken
    );
    const message = SlackNotifications.createDirectMessage(
      directMessageId,
      `A driver and cab has been assigned to your route "*${routeName}*". :smiley:`,
      [attachment]
    );
    return SlackNotifications.sendNotification(message, botToken);
  }

  // TODO: cover lines
  static async getMessageAttachment(route) {
    const { driver, cabDetails } = route;
    const routeFields = await ProviderAttachmentHelper.providerRouteFields(route);
    const driverFields = await ProviderAttachmentHelper.driverFields(driver);
    const cabFields = await ProviderAttachmentHelper.cabFields(cabDetails);

    const attachment = new SlackAttachment('Route Creation Complete');
    attachment.addOptionalProps('assignment_notification', 'fallback', '#3AAF85', 'default');
    attachment.addFieldsOrActions('fields', routeFields);
    attachment.addFieldsOrActions('fields', driverFields);
    attachment.addFieldsOrActions('fields', cabFields);

    return attachment;
  }

  static async providerReassignDriver(payload) {
    try {
      const {
        team: { id: teamId },
        channel: { id: channelId },
        original_message: { ts: timestamp }
      } = payload;
      const driverId = payload.actions[0].selected_options[0].value;
      const routeBatchId = payload.actions[0].name;
      const route = await RouteService.updateRouteBatch(routeBatchId, { driverId });
      const { riders } = route;
      const driver = await driverService.getDriverById(driverId);
      const botToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
      await ProviderNotifications.updateProviderReasignDriverMessage(
        channelId, botToken, timestamp, route, driver
      );
      const sendNotifications = riders.map(user => ProvidersController.sendUserRouteUpdateMessage(
        user, route, driver, botToken
      ));
      await Promise.all(sendNotifications);
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async sendUserRouteUpdateMessage(user, route, driver, botToken) {
    const { slackId } = user;
    const directMessageId = await SlackNotifications.getDMChannelId(
      slackId, botToken
    );
    const attachment = new SlackAttachment();
    attachment.addOptionalProps('', '', '#3c58d7');
    const routeFields = await ProviderAttachmentHelper.providerRouteFields(route);
    const driverFields = await ProviderAttachmentHelper.driverFields(driver);
    attachment.addFieldsOrActions('fields', routeFields);
    attachment.addFieldsOrActions('fields', driverFields);
    const message = SlackNotifications.createDirectMessage(directMessageId,
      'A new driver has been assigned to your route. :smiley:', [attachment]);
    return SlackNotifications.sendNotification(message, botToken);
  }


  static async handleCabReAssigmentNotification(payload, respond) {
    const {
      team: { id: teamId },
      channel: { id: channelId },
      original_message: { ts: timestamp },
    } = payload;
    try {
      const regNumber = payload.actions[0].selected_options[0].value.split(',')[2];
      const { dataValues: cab } = await cabService.findByRegNumber(regNumber);
      const routeBatchId = payload.actions[0].name;
      const route = await RouteService.updateRouteBatch(routeBatchId, { cabId: cab.id });
      const { riders: users } = route;
      const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
      await ProviderNotifications.updateProviderReAssignCabMessage(channelId, slackBotOauthToken, timestamp, route, cab);
      await users.forEach(user => ProvidersController.sendUserUpdatedRouteMessage(user, route, cab, slackBotOauthToken));
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static async sendUserUpdatedRouteMessage(user, route, cab, slackBotOauthToken) {
    const channelId = await SlackNotifications.getDMChannelId(user.slackId, slackBotOauthToken);
    const attachment = new SlackAttachment();
    const routeFields = await ProviderAttachmentHelper.providerRouteFields(route);
    const cabFields = await ProviderAttachmentHelper.cabFields(cab);
    attachment.addFieldsOrActions('fields', routeFields);
    attachment.addFieldsOrActions('fields', cabFields);
    const message = SlackNotifications.createDirectMessage(channelId,
      '*A new cab has been assigned to your route* :smiley:', [attachment]);
    return SlackNotifications.sendNotification(message, slackBotOauthToken);
  }
}

export default ProvidersController;
