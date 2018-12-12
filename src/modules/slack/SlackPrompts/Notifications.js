import { IncomingWebhook } from '@slack/client';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import Utils from '../../../utils';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import { slackEventNames } from '../events/slackEvents';
import SlackEvents from '../events';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction,
  SlackInteractiveMessage
} from '../SlackModels/SlackMessageModels';
import NotificationsResponse from './NotificationsResponse';
import TeamDetailsService from '../../../services/TeamDetailsService';

const web = new WebClientSingleton();

class SlackNotifications {
  static getOpsChannel(team) {
    return team === 'andela-tembea' ? 'CE0F7SZNU' : 'CDZUFP077';
  }

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
      attachments: [
        attachments
      ]
    });
  }

  static async sendManagerTripRequestNotification(payload, tripInformation, respond) {
    try {
      const head = await SlackHelpers.getHeadByDepartmentId(tripInformation.departmentId);
      const requester = await SlackHelpers.findUserByIdOrSlackId(tripInformation.requestedById);
      const newTripRequest = await SlackHelpers.getTripRequest(tripInformation.id);
      const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
      const imResponse = await SlackNotifications.getDMChannelId(head.slackId, slackBotOauthToken);
      const message = SlackNotifications.getManagerMessageAttachment(
        newTripRequest, imResponse, requester
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      respond({
        text: 'Error:warning:: Request saved, but I could not send a notification to your manager.'
      });
    }
  }

  static getManagerMessageAttachment(newTripRequest, imResponse, requester) {
    const attachments = new SlackAttachment('New Trip Request');
    attachments.addOptionalProps('manager_actions', '/fallback', '#3359DF');
    const fields = SlackNotifications.notificationFields(newTripRequest);
    const actions = SlackNotifications.notificationActions(newTripRequest);
    attachments.addFieldsOrActions('fields', fields);
    attachments.addFieldsOrActions('actions', actions);

    return SlackNotifications.createDirectMessage(
      imResponse, `Hey, <@${requester.slackId}> has just booked a trip. :smiley:`, attachments
    );
  }

  static async sendOperationsTripRequestNotification(tripId, payload, respond, tripType = 'regular') {
    const tripInformation = await SlackHelpers.getTripRequest(tripId);
    const { botToken: slackBotOauthToken } = await TeamDetailsService.getTeamDetails(payload.team.id);
    try {
      const checkTripType = tripType === 'regular';
      SlackNotifications.restructureTripData(tripInformation, checkTripType);
      const dept = await SlackHelpers.findSelectedDepartment(tripInformation.departmentId);
      const department = dept.dataValues;
      const { name } = department;
      tripInformation.department = name;

      if (checkTripType) {
        SlackEvents.raise(slackEventNames.TRIP_WAITING_CONFIRMATION, tripInformation, respond, slackBotOauthToken);
      }

      const opsRequestMessage = NotificationsResponse.getRequestMessageForOperationsChannel(
        tripInformation, payload, SlackNotifications.getOpsChannel(payload.team.domain), tripType
      );

      await SlackNotifications.sendNotification(opsRequestMessage, slackBotOauthToken);
    } catch (e) {
      const message = new SlackInteractiveMessage(
        'We could not get the details of the department selected. '
        + 'Please contact the administrator.', [], undefined, '#b52833'
      );
      respond(message);
    }
  }

  static restructureTripData(tripInformation, checkTripType) {
    Object.assign(tripInformation, {
      ...tripInformation,
      requestDate: tripInformation.createdAt,
      departureDate: tripInformation.departureTime,
      rider: tripInformation.rider.dataValues,
      requester: tripInformation.requester.dataValues,
      destination: tripInformation.destination.dataValues,
      pickup: tripInformation.origin.dataValues,
      tripDetail: checkTripType ? null : tripInformation.tripDetail.dataValues,
      origin: {}
    });
  }

  static async sendRequesterApprovedNotification(responseData, respond, slackBotOauthToken) {
    try {
      const dept = await SlackHelpers.findSelectedDepartment(responseData.departmentId);

      if (!dept || !dept.dataValues) return;

      const department = dept.dataValues;
      const { name } = department;

      Object.assign(responseData, { department: name });

      const imResponse = await web.getWebClient(slackBotOauthToken).im.open({
        user: responseData.requester.slackId
      });

      const response = await NotificationsResponse.responseForRequester(
        responseData, imResponse.channel.id
      );
      SlackNotifications.sendNotification(response, slackBotOauthToken);
    } catch (e) {
      respond(new SlackInteractiveMessage('Oopps! We could not process this request.'));
    }
  }

  static async sendNotification(response, teamBotOauthToken) {
    return web.getWebClient(teamBotOauthToken).chat.postMessage(response);
  }

  static async sendWebhookPushMessage(webhookUrl, message) {
    const webhook = new IncomingWebhook(webhookUrl);
    return webhook.send(message);
  }

  static async sendRequesterDeclinedNotification(tripInformation, respond, slackBotOauthToken) {
    try {
      const requester = await SlackHelpers.findUserByIdOrSlackId(tripInformation.requestedById);
      const decliner = await SlackHelpers.findUserByIdOrSlackId(tripInformation.declinedById);

      const attachments = new SlackAttachment('Declined Trip Request');
      attachments.addOptionalProps('', '/fallback', '#3359DF');
      const fields = SlackNotifications.notificationFields(tripInformation);
      fields.push(new SlackAttachmentField('Reason', tripInformation.managerComment, false));
      attachments.addFieldsOrActions('fields', fields);

      const imResponse = await SlackNotifications.getDMChannelId(requester.slackId, slackBotOauthToken);
      const message = SlackNotifications.createDirectMessage(
        imResponse,
        `Sorry, <@${decliner.slackId}> has just declined your trip. :disappointed:`,
        attachments
      );
      return SlackNotifications.sendNotification(message, slackBotOauthToken);
    } catch (error) {
      respond({
        text: 'Error:warning:: Decline saved but requester will not get the notification'
      });
    }
  }

  static createDirectMessage(channelId, text, attachments) {
    return {
      channel: channelId,
      text,
      attachments: [attachments]
    };
  }

  static async sendManagerConfirmOrDeclineNotification(payload, tripInformation, decline) {
    const { headId } = tripInformation.department.dataValues;
    const headOfDepartment = await SlackHelpers.findUserByIdOrSlackId(headId);
    const rider = tripInformation.rider.dataValues.slackId;
    const { slackId } = headOfDepartment;
    const messageBaseOnDecline = SlackNotifications.getMessageBaseOnDeclineOrConfirm(decline);
    const message = `The trip you approved for <@${rider}> trip has been ${messageBaseOnDecline}`;
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    const channelId = await SlackNotifications.getDMChannelId(slackId, slackBotOauthToken);
    const attachments = new SlackAttachment(!decline ? 'Confirmed Trip Request' : 'Declined Trip Request');
    attachments.addOptionalProps('', '/fallback', !decline ? '#007F00' : '#FF0000');
    const fields = SlackNotifications.getFieldsToDisplay(tripInformation, payload, decline);
    attachments.addFieldsOrActions('fields', fields);
    SlackNotifications.sendNotifications(channelId, attachments, message, slackBotOauthToken);
  }

  static getFieldsToDisplay(tripInformation, payload, decline) {
    let fields;
    if (!decline) {
      fields = SlackNotifications.approveNotificationFields(
        tripInformation,
        payload
      );
      return fields;
    // eslint-disable-next-line no-else-return
    } else {
      fields = SlackNotifications.declineNotificationFields(
        tripInformation,
        payload
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

  static async sendUserConfirmOrDeclineNotification(payload, tripInformation, decline) {
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    const requester = tripInformation.requester.dataValues.slackId;
    const rider = tripInformation.rider.dataValues.slackId;
    let message;
    let channelId;
    const attachments = new SlackAttachment(!decline ? 'Confirmed Trip Request' : 'Declined Trip Request');
    attachments.addOptionalProps('', '/fallback', !decline ? '#007F00' : '#FF0000');
    const fields = SlackNotifications.getFieldsToDisplay(tripInformation, payload, decline);
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
  }

  static notificationActions(tripInformation) {
    return [
      new SlackButtonAction('manager_approve', 'Approve', tripInformation.id),
      new SlackButtonAction('manager_decline', 'Decline', tripInformation.id, 'danger')
    ];
  }

  static notificationFields(tripInformation) {
    const pickup = tripInformation.origin.dataValues.address;
    const destination = tripInformation.destination.dataValues.address;
    return [
      new SlackAttachmentField('Pickup Location', pickup, true),
      new SlackAttachmentField('Destination', destination, true),
      new SlackAttachmentField('Request Date',
        Utils.formatDate(tripInformation.createdAt), true),
      new SlackAttachmentField('Trip Date',
        Utils.formatDate(tripInformation.departureTime), true)
    ];
  }

  static declineNotificationFields(tripInformation, payload) {
    const reason = tripInformation.operationsComment;
    const { id } = payload.user;
    const notifications = SlackNotifications.notificationFields(tripInformation);
    const decliner = new SlackAttachmentField('', `Declined by <@${id}>`, false);
    const commentField = new SlackAttachmentField('Reason', reason, false);
    notifications.unshift(decliner);
    notifications.push(commentField);
    return notifications;
  }

  static approveNotificationFields(tripInformation, payload) {
    const reason = tripInformation.operationsComment;
    const { id } = payload.user;
    const { driverName, driverPhoneNo, regNumber } = tripInformation.cab.dataValues;
    const notifications = SlackNotifications.notificationFields(tripInformation);
    const decliner = new SlackAttachmentField('', `Confirmed by <@${id}>`, false);
    const commentField = new SlackAttachmentField('Reason', reason, false);
    notifications.unshift(decliner);
    notifications.push(commentField);
    const cabAttachmentFields = [
      new SlackAttachmentField(null, null, false),
      new SlackAttachmentField('Cab Details', null, false),
      new SlackAttachmentField('Driver Name', driverName, true),
      new SlackAttachmentField('Driver Contacts', driverPhoneNo, true),
      new SlackAttachmentField('Registration Number', regNumber, true),
    ];
    notifications.push(...cabAttachmentFields);
    return notifications;
  }
}

export default SlackNotifications;
