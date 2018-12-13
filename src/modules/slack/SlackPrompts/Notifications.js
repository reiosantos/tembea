import SlackHelpers from '../../../helpers/slack/slackHelpers';
import Utils from '../../../utils';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import { SlackEvents, slackEventsNames } from '../events/slackEvents';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction,
  SlackInteractiveMessage
} from '../SlackModels/SlackMessageModels';
import NotificationsResponse from './NotificationsResponse';

const web = new WebClientSingleton();

class SlackNotifications {
  static async getDMChannelId(user) {
    const imResponse = await web.getWebClient().im.open({
      user
    });
    const { id } = imResponse.channel;
    return id;
  }

  static sendNotifications(channelId, attachments, text) {
    return web.getWebClient().chat.postMessage({
      channel: channelId,
      text,
      attachments: [
        attachments
      ]
    });
  }

  static async sendManagerTripRequestNotification(tripInformation, respond) {
    try {
      const head = await SlackHelpers.getHeadByDepartmentId(tripInformation.departmentId);
      const requester = await SlackHelpers.findUserByIdOrSlackId(tripInformation.requestedById);
      const newTripRequest = await SlackHelpers.getTripRequest(tripInformation.id);

      const imResponse = await SlackNotifications.getDMChannelId(head.slackId);
      const message = SlackNotifications.getManagerMessageAttachment(
        newTripRequest, imResponse, requester
      );
      return SlackNotifications.sendNotification(message);
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

  static async sendOperationsTripRequestNotification(tripId, payload, respond) {
    const tripInformation = await SlackHelpers.getTripRequest(tripId);
    try {
      SlackNotifications.restructureTripData(tripInformation);
      const dept = await SlackHelpers.findSelectedDepartment(tripInformation.departmentId);

      const department = dept.dataValues;
      const { name } = department;
      tripInformation.department = name;

      SlackEvents.raise(slackEventsNames.TRIP_WAITING_CONFIRMATION, tripInformation, respond);

      SlackNotifications.sendNotification(
        NotificationsResponse.responseForOperationsChannel(
          tripInformation, payload
        )
      );
    } catch (e) {
      const message = new SlackInteractiveMessage(
        'We could not get the details of the department selected. '
        + 'Please contact the administrator.', [], undefined, '#b52833'
      );
      respond(message);
    }
  }

  static restructureTripData(tripInformation) {
    Object.assign(tripInformation, {
      ...tripInformation,
      requestDate: tripInformation.createdAt,
      departureDate: tripInformation.departureTime,
      rider: tripInformation.rider.dataValues,
      requester: tripInformation.requester.dataValues,
      destination: tripInformation.destination.dataValues,
      pickup: tripInformation.origin.dataValues,
      origin: {}
    });
  }

  static async sendRequesterApprovedNotification(responseData, respond) {
    try {
      const dept = await SlackHelpers.findSelectedDepartment(responseData.departmentId);

      if (!dept || !dept.dataValues) return;

      const department = dept.dataValues;
      const { name } = department;

      Object.assign(responseData, { department: name });

      const imResponse = await web.getWebClient().im.open({
        user: responseData.requester.slackId
      });

      const response = await NotificationsResponse.responseForRequester(
        responseData, imResponse.channel.id
      );
      SlackNotifications.sendNotification(response);
    } catch (e) {
      respond(new SlackInteractiveMessage('Oopps! We could not process this request.'));
    }
  }

  static async sendNotification(response) {
    return web.getWebClient().chat.postMessage(response);
  }

  static async sendRequesterDeclinedNotification(tripInformation, respond) {
    try {
      const requester = await SlackHelpers.findUserByIdOrSlackId(tripInformation.requestedById);
      const decliner = await SlackHelpers.findUserByIdOrSlackId(tripInformation.declinedById);

      const attachments = new SlackAttachment('Declined Trip Request');
      attachments.addOptionalProps('', '/fallback', '#3359DF');
      const fields = SlackNotifications.notificationFields(tripInformation);
      fields.push(new SlackAttachmentField('Reason', tripInformation.managerComment, false));
      attachments.addFieldsOrActions('fields', fields);

      const imResponse = await SlackNotifications.getDMChannelId(requester.slackId);
      const message = SlackNotifications.createDirectMessage(
        imResponse,
        `Sorry, <@${decliner.slackId}> has just declined your trip. :disappointed:`,
        attachments
      );
      return SlackNotifications.sendNotification(message);
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

  static async sendManagerNotification(payload, tripInformation) {
    const { headId } = tripInformation.department.dataValues;
    const headOfDepartment = await SlackHelpers.findUserByIdOrSlackId(headId);
    const rider = tripInformation.rider.dataValues.slackId;
    const { slackId } = headOfDepartment;
    const message = `The trip you approved for <@${rider}> trip has been declined`;
    const channelId = await SlackNotifications.getDMChannelId(slackId);
    const attachments = new SlackAttachment('Declined Trip Request');
    attachments.addOptionalProps('', '/fallback', '#FF0000');
    const fields = SlackNotifications.declineNotificationFields(
      tripInformation,
      payload
    );
    attachments.addFieldsOrActions('fields', fields);
    SlackNotifications.sendNotifications(channelId, attachments, message);
  }

  static async sendManagerConfirmNotification(payload, tripInformation) {
    const { headId } = tripInformation.department.dataValues;
    const headOfDepartment = await SlackHelpers.findUserByIdOrSlackId(headId);
    const rider = tripInformation.rider.dataValues.slackId;
    const { slackId } = headOfDepartment;
    const message = `The trip you approved for <@${rider}> trip has been Confirmed. :smiley:`;
    const channelId = await SlackNotifications.getDMChannelId(slackId);
    const attachments = new SlackAttachment('Confirmed Trip Request');
    attachments.addOptionalProps('', '/fallback', '#007F00');
    const fields = SlackNotifications.approveNotificationFields(
      tripInformation,
      payload
    );
    attachments.addFieldsOrActions('fields', fields);
    SlackNotifications.sendNotifications(channelId, attachments, message);
  }

  static async sendUserNotification(payload, tripInformation) {
    const requester = tripInformation.requester.dataValues.slackId;
    const rider = tripInformation.rider.dataValues.slackId;
    let message;
    let channelId;
    const attachments = new SlackAttachment('Declined Trip Request');
    attachments.addOptionalProps('', '/fallback', '#FF0000');
    const fields = SlackNotifications.declineNotificationFields(
      tripInformation,
      payload
    );
    attachments.addFieldsOrActions('fields', fields);
    if (requester !== rider) {
      channelId = await SlackNotifications.getDMChannelId(requester);
      message = `The trip you requested for <@${rider}> trip has been declined :disappointed: `;
      SlackNotifications.sendNotifications(channelId, attachments, message);
    }
    message = 'Your trip has been declined';
    channelId = await SlackNotifications.getDMChannelId(rider);
    SlackNotifications.sendNotifications(channelId, attachments, message);
  }


  static async sendUserConfirmNotification(payload, tripInformation) {
    const requester = tripInformation.requester.dataValues.slackId;
    const rider = tripInformation.rider.dataValues.slackId;
    let message;
    let channelId;
    const attachments = new SlackAttachment('Confirmed Trip Request');
    attachments.addOptionalProps('', '/fallback', '#007F00');
    const fields = SlackNotifications.approveNotificationFields(
      tripInformation,
      payload
    );
    attachments.addFieldsOrActions('fields', fields);
    if (requester !== rider) {
      channelId = await SlackNotifications.getDMChannelId(requester);
      message = `The trip you requested for <@${rider}> trip has been confirmed. :smiley:`;
      SlackNotifications.sendNotifications(channelId, attachments, message);
    }
    message = 'Your trip has been Confirmed';
    channelId = await SlackNotifications.getDMChannelId(rider);
    SlackNotifications.sendNotifications(channelId, attachments, message);
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
