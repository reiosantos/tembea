import { IncomingWebhook } from '@slack/client';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import Utils from '../../../utils';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction,
  SlackInteractiveMessage,
  SlackCancelButtonAction
} from '../SlackModels/SlackMessageModels';
import NotificationsResponse from './NotificationsResponse';
import TeamDetailsService from '../../../services/TeamDetailsService';
import DepartmentService from '../../../services/DepartmentService';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import RouteRequestService from '../../../services/RouteRequestService';
import AttachmentHelper from './notifications/AttachmentHelper';
import Services from '../../../services/UserService';
import tripService from '../../../services/TripService';
import TripCompletion from '../../../services/jobScheduler/jobs/TripCompletionJob';
import CleanData from '../../../helpers/cleanData';

const web = new WebClientSingleton();

class SlackNotifications {
  static async getDMChannelId(user, teamBotOauthToken) {
    const imResponse = await web.getWebClient(teamBotOauthToken).im.open({
      user
    });
    const { id } = imResponse.channel;
    return id;
  }

  static sendNotifications(channelId, attachments, text, teamBotOauthToken) {
    return web.getWebClient(teamBotOauthToken).chat.postMessage({
      channel: channelId,
      text,
      attachments: [attachments]
    });
  }

  static async sendManagerTripRequestNotification(data, tripInfo, respond, type = 'newTrip') {
    try {
      const payload = CleanData.trim(data);
      const {
        id, departmentId, requestedById, riderId
      } = tripInfo;
      const [
        head, requester, rider, newTripRequest, slackBotOauthToken
      ] = await Promise.all([
        DepartmentService.getHeadByDeptId(departmentId),
        SlackHelpers.findUserByIdOrSlackId(requestedById),
        SlackHelpers.findUserByIdOrSlackId(riderId),
        tripService.getById(id),
        TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id)
      ]);
      const imResponse = await SlackNotifications.getDMChannelId(head.slackId, slackBotOauthToken);
      const message = await SlackNotifications.getManagerMessageAttachment(
        newTripRequest, imResponse, requester, type, rider
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
      respond({
        text: 'Error:warning:: Request saved, but I could not send a notification to your manager.'
      });
    }
  }

  static async getManagerMessageAttachment(newTripRequest,
    imResponse, requester, requestType, rider) {
    const { tripStatus } = newTripRequest;
    const text = requestType === 'newTrip' ? 'booked a' : 'rescheduled this';
    const attachments = new SlackAttachment('Trip Request');
    attachments.addOptionalProps('manager_actions', '/fallback', '#3359DF');
    await Services.findOrCreateNewUserWithSlackId(rider);
    let fields = null;
    fields = SlackNotifications.notificationFields(newTripRequest);
    attachments.addFieldsOrActions('fields', fields);

    if (tripStatus === 'Pending') {
      const actions = SlackNotifications.notificationActions(newTripRequest);
      attachments.addFieldsOrActions('actions', actions);
    }
    let msg = `Hey, <@${requester.slackId}> has just ${text} trip. :smiley:`;
    if (requester.slackId !== rider.slackId) {
      msg = `Hey, <@${requester.slackId}> has just ${text} trip for <@${
        rider.slackId}>. :smiley:`;
    }
    return SlackNotifications.createDirectMessage(imResponse, msg, attachments);
  }

  static async sendOperationsTripRequestNotification(trip, data, respond, type = 'regular') {
    try {
      const payload = CleanData.trim(data);
      const tripInformation = trip;
      const { botToken: slackBotOauthToken, opsChannelId } = await TeamDetailsService.getTeamDetails(payload.team.id);
      const checkTripType = type === 'regular';
      const { name } = await DepartmentService
        .getById(tripInformation.departmentId);
      tripInformation.department = name;
      if (checkTripType) {
        SlackNotifications.sendRequesterApprovedNotification(
          tripInformation, respond, slackBotOauthToken
        );
      }
      tripInformation.pickup = tripInformation.origin;
      const opsRequestMessage = NotificationsResponse.getRequestMessageForOperationsChannel(
        tripInformation, payload, opsChannelId, type
      );
      await SlackNotifications.sendNotification(opsRequestMessage, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
      const message = new SlackInteractiveMessage(
        'An error occurred while processing your request. '
          + 'Please contact the administrator.', [], undefined, '#b52833'
      );
      respond(message);
    }
  }

  static async sendRequesterApprovedNotification(
    data,
    respond,
    slackBotOauthToken
  ) {
    try {
      const responseData = CleanData.trim(data);
      const dept = await DepartmentService.getById(
        responseData.departmentId
      );

      if (!dept) return;

      const { head: { name } } = dept;

      Object.assign(responseData, { department: name });

      const imResponse = await web.getWebClient(slackBotOauthToken).im.open({
        user: responseData.requester.slackId
      });
      const response = await NotificationsResponse.responseForRequester(
        responseData,
        imResponse.channel.id
      );
      SlackNotifications.sendNotification(response, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Oops! We could not process this request.')
      );
    }
  }

  static async sendNotification(response, teamBotOauthToken) {
    return web.getWebClient(teamBotOauthToken).chat.postMessage(response);
  }

  static async sendWebhookPushMessage(webhookUrl, message) {
    const webhook = new IncomingWebhook(webhookUrl);
    return webhook.send(message);
  }

  static async sendRequesterDeclinedNotification(data, respond,
    slackBotOauthToken) {
    try {
      const tripInformation = CleanData.trim(data);
      const [requester, decliner] = await Promise.all([
        SlackHelpers.findUserByIdOrSlackId(tripInformation.requestedById),
        SlackHelpers.findUserByIdOrSlackId(tripInformation.declinedById)
      ]);
      const attachments = new SlackAttachment('Declined Trip Request');
      attachments.addOptionalProps('', '/fallback', '#3359DF');
      const fields = SlackNotifications.notificationFields(tripInformation);
      fields.push(new SlackAttachmentField('Reason', tripInformation.managerComment, false));
      attachments.addFieldsOrActions('fields', fields);
      const { slackId } = requester;
      const imResponse = await SlackNotifications.getDMChannelId(slackId, slackBotOauthToken);
      const message = SlackNotifications.createDirectMessage(
        imResponse, `Sorry, <@${decliner.slackId}> has just declined your trip. :disappointed:`,
        attachments
      );
      await SlackNotifications.sendNotification(message, slackBotOauthToken);
      return;
    } catch (error) {
      bugsnagHelper.log(error);
      respond({
        text: 'Error:warning:: Decline saved but requester will not get the notification'
      });
    }
  }

  static createDirectMessage(channelId, text, payload) {
    let attachments = [payload];
    if (payload instanceof Array) {
      attachments = payload;
    }
    return {
      channel: channelId,
      text,
      attachments
    };
  }

  static async sendManagerConfirmOrDeclineNotification(
    teamId, userId, tripInformation, decline
  ) {
    const { headId } = tripInformation.department;
    const headOfDepartment = await SlackHelpers.findUserByIdOrSlackId(headId);
    const rider = tripInformation.rider.slackId;
    const { slackId } = headOfDepartment;
    const messageBaseOnDecline = SlackNotifications.getMessageBaseOnDeclineOrConfirm(decline);
    const message = `The trip you approved for <@${rider}> trip has been ${messageBaseOnDecline}`;
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const channelId = await SlackNotifications.getDMChannelId(slackId, slackBotOauthToken);
    const label = !decline ? 'Confirmed Trip Request' : 'Declined Trip Request';
    const attachments = new SlackAttachment(label);
    attachments.addOptionalProps(
      '',
      '/fallback',
      !decline ? '#007F00' : '#FF0000'
    );
    const fields = SlackNotifications.getFieldsToDisplay(
      tripInformation, userId, decline
    );
    attachments.addFieldsOrActions('fields', fields);
    await SlackNotifications.sendNotifications(
      channelId, attachments, message, slackBotOauthToken
    );
  }

  static getFieldsToDisplay(tripInformation, userId, decline) {
    let fields;
    if (!decline) {
      fields = SlackNotifications.approveNotificationFields(
        tripInformation,
        userId
      );
      return fields;
      // eslint-disable-next-line no-else-return
    } else {
      fields = SlackNotifications.declineNotificationFields(
        tripInformation,
        userId
      );
      return fields;
    }
  }

  static getMessageBaseOnDeclineOrConfirm(decline) {
    if (!decline) {
      return 'confirmed. :smiley:';
    }
    return 'declined :disappointed:';
  }

  static async sendUserConfirmOrDeclineNotification(
    teamId, userId, tripInformation, decline
  ) {
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const requester = tripInformation.requester.slackId;
    const rider = tripInformation.rider.slackId;
    let message;
    let channelId;
    const label = !decline ? 'Confirmed Trip Request' : 'Declined Trip Request';
    const attachments = new SlackAttachment(label);
    attachments.addOptionalProps('', '/fallback', !decline ? '#007F00' : '#FF0000');
    const fields = SlackNotifications.getFieldsToDisplay(
      tripInformation, userId, decline
    );
    attachments.addFieldsOrActions('fields', fields);
    if (requester !== rider) {
      channelId = await SlackNotifications.getDMChannelId(requester, slackBotOauthToken);
      const messageBaseOnDecline = SlackNotifications.getMessageBaseOnDeclineOrConfirm(decline);
      message = `The trip you requested for <@${rider}> trip has been ${messageBaseOnDecline}`;
      SlackNotifications.sendNotifications(channelId, attachments, message, slackBotOauthToken);
    }
    const confirmedOrDeclined = !decline ? 'Confirmed' : 'declined';
    message = `Your trip has been ${confirmedOrDeclined}`;
    channelId = await SlackNotifications.getDMChannelId(rider, slackBotOauthToken);
    SlackNotifications.sendNotifications(channelId, attachments, message, slackBotOauthToken);
    if (confirmedOrDeclined === 'Confirmed') {
      TripCompletion.createScheduleForATrip(tripInformation);
    }
  }

  static async sendRiderlocationConfirmNotification(payload) {
    const {
      location, teamID, userID, rider
    } = payload;
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamID);
    const label = `Travel ${location} Location Confirmation`;
    const attachment = new SlackAttachment(label, '', '', '', '', 'default', 'warning');
    const actions = [
      new SlackButtonAction('riderLocationBtn', `Submit ${location}`, `${location}_riderLocation`),
      new SlackCancelButtonAction(
        'Cancel Travel Request',
        'cancel',
        'Are you sure you want to cancel this travel request',
        'cancel_request'
      )
    ];
    attachment.addFieldsOrActions('actions', actions);
    attachment.addOptionalProps('travel_trip_riderLocationConfirmation',
      'fallback', undefined, 'default');
    const channelId = await SlackNotifications.getDMChannelId(rider, slackBotOauthToken);
    const letterMessage = `You are hereby Requested by <@${userID}> to provide `
    + `your ${location} location`;
    SlackNotifications.sendNotifications(channelId, attachment, letterMessage, slackBotOauthToken);
  }

  static async sendOperationsRiderlocationConfirmation(payload, respond) {
    const {
      riderID, teamID, confirmedLocation, waitingRequester, location
    } = payload;
    try {
      const {
        botToken: slackBotOauthToken,
        opsChannelId
      } = await TeamDetailsService.getTeamDetails(teamID);
      SlackNotifications.OperationsRiderlocationConfirmationMessage({
        waitingRequester, riderID, location, confirmedLocation, opsChannelId, slackBotOauthToken
      });
    } catch (error) {
      bugsnagHelper.log(error);
      const message = new SlackInteractiveMessage(
        'An error occurred while processing your request. '
          + 'Please contact the administrator.', [], undefined, '#b52833'
      );
      respond(message);
    }
  }

  static OperationsRiderlocationConfirmationMessage(messageData) {
    const {
      waitingRequester, riderID, location, confirmedLocation, opsChannelId, slackBotOauthToken
    } = messageData;
    const attachment = new SlackAttachment(
      `Hello <@${waitingRequester}> :smiley:, <@${riderID}>`
      + ` just confirmed the ${location} location`,
      `The entered ${location} location is ${confirmedLocation}`,
      '', '', '', 'default', 'warning'
    );
    const actions = [
      new SlackButtonAction('allConfirmed', `Confirm ${location}`, 'locationConfrimed'),
      new SlackCancelButtonAction(
        'Cancel Travel Request', 'cancel',
        'Are you sure you want to cancel this travel request', 'cancel_request'
      )
    ];
    attachment.addFieldsOrActions('actions', actions);
    attachment.addOptionalProps('travel_trip_detailsConfirmation',
      'fallback', undefined, 'default');
    const letterMessage = `Tembea travel ${location} confirmation`;
    SlackNotifications.sendNotifications(opsChannelId,
      attachment, letterMessage, slackBotOauthToken);
  }

  static notificationActions(tripInformation) {
    return [
      new SlackButtonAction('managerApprove', 'Approve', tripInformation.id),
      new SlackButtonAction(
        'managerDecline',
        'Decline',
        tripInformation.id,
        'danger'
      )
    ];
  }

  static notificationFields(tripInformation) {
    const {
      origin: { address: pickup },
      destination: { address: destination },
      rider: { name: passenger },
      createdAt,
      departureTime,
      reason,
      tripNote
    } = tripInformation;
    return [
      new SlackAttachmentField('Pickup Location', pickup, true),
      new SlackAttachmentField('Destination', destination, true),
      new SlackAttachmentField('Request Date',
        Utils.formatDate(createdAt), true),
      new SlackAttachmentField('Trip Date',
        Utils.formatDate(departureTime), true),
      new SlackAttachmentField('Reason', reason, true),
      new SlackAttachmentField('Passenger', passenger, true),
      new SlackAttachmentField('Trip Notes', tripNote, true),
    ];
  }

  static declineNotificationFields(tripInformation, userId) {
    const reason = tripInformation.operationsComment;
    const notifications = SlackNotifications.notificationFields(
      tripInformation
    );
    const decliner = new SlackAttachmentField(
      '',
      `Declined by <@${userId}>`,
      false
    );
    const commentField = new SlackAttachmentField('Reason', reason, false);
    notifications.unshift(decliner);
    notifications.push(commentField);
    return notifications;
  }

  static approveNotificationFields(tripInformation, userId) {
    const reason = tripInformation.operationsComment;
    const { driverName, driverPhoneNo, regNumber } = tripInformation.cab;
    const notifications = SlackNotifications.notificationFields(
      tripInformation
    );
    const decliner = new SlackAttachmentField(
      '',
      `Confirmed by <@${userId}>`,
      false
    );
    const commentField = new SlackAttachmentField('Reason', reason, false);
    notifications.unshift(decliner);
    notifications.push(commentField);
    const cabAttachmentFields = [
      new SlackAttachmentField(null, null, false),
      new SlackAttachmentField('Cab Details', null, false),
      new SlackAttachmentField('Driver Name', driverName, true),
      new SlackAttachmentField('Driver Contacts', driverPhoneNo, true),
      new SlackAttachmentField('Registration Number', regNumber, true)
    ];
    notifications.push(...cabAttachmentFields);
    return notifications;
  }

  static sendOperationsNotificationFields(routeRequest) {
    const { routeImageUrl, id: routeRequestId, manager } = routeRequest;
    const acceptButton = new SlackButtonAction('approve', 'Approve', routeRequestId);
    const declineButton = new SlackButtonAction('decline', 'Decline', routeRequestId,
      'danger');
    const messageAttachment = new SlackAttachment(undefined, undefined, undefined,
      undefined, routeImageUrl);
    const routeAttachmentFields = AttachmentHelper.routeAttachmentFields(
      routeRequest
    );
    const engagementAttachmentFields = AttachmentHelper.engagementAttachmentFields(
      routeRequest
    );
    const attachments = [
      new SlackAttachmentField('`Engagement Information`', null, false),
      ...engagementAttachmentFields,
      new SlackAttachmentField('`Manager`', `<@${manager.slackId}>`, false),
      new SlackAttachmentField('`Route Information`', null, false),
      ...routeAttachmentFields
    ];
    messageAttachment.addFieldsOrActions('actions', [acceptButton, declineButton]);
    messageAttachment.addFieldsOrActions('fields', attachments);
    messageAttachment.addOptionalProps('operations_route_actions');
    return messageAttachment;
  }

  static async sendOperationsNewRouteRequest(teamId, routeRequestId) {
    const routeRequestDetails = await RouteRequestService.getRouteRequest(
      routeRequestId
    );
    const {
      engagement: {
        fellow: { slackId: fellow }
      }
    } = routeRequestDetails;
    const messageAttachment = SlackNotifications.sendOperationsNotificationFields(
      routeRequestDetails
    );
    const teamDetails = await TeamDetailsService.getTeamDetails(teamId);
    const { botToken, opsChannelId } = teamDetails;

    SlackNotifications.sendNotifications(
      opsChannelId,
      messageAttachment,
      `Hey :simple_smile: <@${fellow}> requested a new route`,
      botToken
    );
  }
}

export default SlackNotifications;
