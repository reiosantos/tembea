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
  static async sendManagerTripRequestNotification(tripInformation, respond) {
    try {
      const head = await SlackHelpers.getHeadByDepartmentId(tripInformation.departmentId);
      const requester = await SlackHelpers.findUserByIdOrSlackId(tripInformation.requestedById);
      const newTripRequest = await SlackHelpers.getTripRequest(tripInformation.id);

      const pickup = newTripRequest.origin.dataValues.address;
      const destination = newTripRequest.destination.dataValues.address;

      const imResponse = await web.getWebClient().im.open({
        user: head.slackId
      });

      const message = SlackNotifications.getManagerMessageAttachment(
        pickup, destination, newTripRequest, imResponse, requester
      );
      return SlackNotifications.sendNotification(message);
    } catch (error) {
      respond({
        text: 'Error:warning:: Request saved, but I could not send a notification to your manager.'
      });
    }
  }

  static getManagerMessageAttachment(pickup, destination, newTripRequest, imResponse, requester) {
    const attachments = new SlackAttachment('New Trip Request');
    attachments.addOptionalProps('manager_actions', '/fallback', '#3359DF');
    const fields = SlackNotifications.notificationFields(pickup,
      destination,
      newTripRequest);
    const actions = SlackNotifications.notificationActions(newTripRequest);
    attachments.addFieldsOrActions('fields', fields);
    attachments.addFieldsOrActions('actions', actions);

    return SlackNotifications.createDirectMessage(
      imResponse, `Hey, <@${requester.slackId}> has just booked a trip. :smiley:`, attachments
    );
  }

  static async sendOperationsTripRequestNotification(tripId, respond) {
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
          tripInformation
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

  static sendNotification(response) {
    return web.getWebClient().chat.postMessage(response);
  }

  static async sendRequesterDeclinedNotification(tripInformation, respond) {
    try {
      const requester = await SlackHelpers.findUserByIdOrSlackId(tripInformation.requestedById);
      const decliner = await SlackHelpers.findUserByIdOrSlackId(tripInformation.declinedById);
      const pickup = tripInformation.origin.dataValues.address;
      const destination = tripInformation.destination.dataValues.address;

      const attachments = new SlackAttachment('Declined Trip Request');
      attachments.addOptionalProps('', '/fallback', '#3359DF');
      const fields = SlackNotifications.notificationFields(pickup, destination, tripInformation);
      fields.push(new SlackAttachmentField('Reason', tripInformation.managerComment, false));
      attachments.addFieldsOrActions('fields', fields);

      const imResponse = await web.getWebClient().im.open({ user: requester.slackId });
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

  static createDirectMessage(imResponse, text, attachments) {
    return {
      channel: imResponse.channel.id,
      text,
      attachments: [attachments]
    };
  }

  static notificationActions(tripInformation) {
    return [
      new SlackButtonAction('manager_approve', 'Approve', tripInformation.id),
      new SlackButtonAction('manager_decline', 'Decline', tripInformation.id, 'danger')
    ];
  }

  static notificationFields(pickup, destination, tripInformation) {
    return [
      new SlackAttachmentField('Pickup Location', pickup, true),
      new SlackAttachmentField('Destination', destination, true),
      new SlackAttachmentField('Request Date',
        Utils.formatDate(tripInformation.createdAt), true),
      new SlackAttachmentField('Trip Date',
        Utils.formatDate(tripInformation.departureTime), true)
    ];
  }
}

export default SlackNotifications;
