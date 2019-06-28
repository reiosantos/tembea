import moment from 'moment';
import AttachmentHelper from '../AttachmentHelper';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction
} from '../../../SlackModels/SlackMessageModels';
import SlackNotifications from '../../Notifications';
import { getSlackDateString } from '../../../helpers/dateHelpers';


class ProviderAttachmentHelper {
  static createProviderRouteAttachment(routeRequest, channelID, submission) {
    const { status } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status, 'Approved');
    if (!data) return;
    const {
      title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const routeInformation = ProviderAttachmentHelper.routeInfoAttachment(submission);
    const { id: routeRequestId } = routeRequest.dataValues;
    const routeInfo = JSON.stringify(submission);
    routeInformation.addFieldsOrActions('actions', [
      new SlackButtonAction('Accept', 'Accept', `accept_request_${routeRequestId}_${routeInfo}`)
    ]);
    const attachments = [
      attachment, routeAttachment, routeInformation
    ];
    attachments.filter(item => !!item).forEach(at => at.addOptionalProps('providers_route_approval', '/fallback', color));
    return SlackNotifications.createDirectMessage(
      channelID,
      'Hi :smiley:, you have received a route request, please assign a cab and a driver',
      attachments
    );
  }

  static routeInfoAttachment(submission) {
    const { routeName: name, takeOffTime } = submission;
    const time = moment(takeOffTime, 'HH:mm').format('LT');
    const attachments = new SlackAttachment('');
    const fields = [
      new SlackAttachmentField('Route Name', name, true),
      new SlackAttachmentField('Take-off Time', time, true),
    ];
    attachments.addFieldsOrActions('fields', fields);
    return attachments;
  }

  static providerFields(tripInformation, driverDetails) {
    const {
      noOfPassengers,
      origin: { address: pickup },
      destination: { address: destination },
      rider: { name: passenger, phoneNo },
      createdAt,
      departureTime,
      cab: { regNumber, model },
    } = tripInformation;
    const [, driverName, driverPhoneNo] = driverDetails.split(',');
    return [
      new SlackAttachmentField('Pickup Location', pickup, true),
      new SlackAttachmentField('Destination', destination, true),
      new SlackAttachmentField('Request Date',
        getSlackDateString(createdAt), true),
      new SlackAttachmentField('Trip Date',
        getSlackDateString(departureTime), true),
      new SlackAttachmentField('Passenger', passenger, true),
      new SlackAttachmentField('Passenger Contact', phoneNo || 'N/A', true),
      new SlackAttachmentField('Number of Riders', noOfPassengers, true),
      new SlackAttachmentField('Driver Name', driverName, true),
      new SlackAttachmentField('Driver Contact', driverPhoneNo, true),
      new SlackAttachmentField('Vehicle Model', model, true),
      new SlackAttachmentField('Vehicle Number', regNumber, true)
    ];
  }

  static providerRouteFields(routeInformation) {
    const {
      route: { name },
      batch,
      takeOff,
    } = routeInformation;

    return [
      new SlackAttachmentField('*_`Route Information`_*', null, false),
      new SlackAttachmentField('Route Name', name, true),
      new SlackAttachmentField('Route Batch', batch, true),
      new SlackAttachmentField('Take Off Time', takeOff, true),
    ];
  }

  static driverFields(driverInformation) {
    const { driverName, driverPhoneNo } = driverInformation;

    return [
      new SlackAttachmentField('*_`Driver Information`_*', null, false),
      new SlackAttachmentField('DriverName', driverName, true),
      new SlackAttachmentField('Driver Contact', driverPhoneNo, true),
    ];
  }


  static async getManagerApproveAttachment(routeRequest, channelID, submission, managerStatus) {
    const { engagement: { fellow }, manager, status } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status, 'Approved');
    if (!data) return;
    const {
      action, emoji, title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const routeInformation = ProviderAttachmentHelper.providerRouteInformation(submission);
    const engagementAttachment = await AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [
      attachment, routeAttachment, engagementAttachment, routeInformation
    ];
    attachments
      .filter(item => !!item)
      .forEach(at => at.addOptionalProps('', '/fallback', color));
    const greeting = managerStatus ? `Hi, <@${manager.slackId}>` : 'Hi there';
    return SlackNotifications.createDirectMessage(
      channelID,
      `${greeting}, the route request you confirmed for 
      <@${fellow.slackId}> has been ${action} ${emoji}`,
      attachments
    );
  }

  static async getFellowApproveAttachment(routeRequest, channelID, submission) {
    const { engagement: { fellow }, status } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status, 'Approved');
    if (!data) return;
    const {
      action, emoji, title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const routeInformation = ProviderAttachmentHelper.providerRouteInformation(submission);
    const engagementAttachment = await AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [
      attachment, routeAttachment, engagementAttachment, routeInformation
    ];
    attachments
      .filter(item => !!item)
      .forEach(at => at.addOptionalProps('', '/fallback', color));
    const greeting = `Hi, <@${fellow.slackId}>`;
    return SlackNotifications.createDirectMessage(
      channelID,
      `${greeting}, the operations team ${action} your request ${emoji}. You have also been added to the Route you requested`,
      attachments
    );
  }

  static async getProviderCompleteAttachment(message, title, routeRequest, submission) {
    const footer = new SlackAttachment(message);
    const header = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const routeInformation = ProviderAttachmentHelper.providerRouteInformation(submission);
    const attachments = [header, routeAttachment, routeInformation, footer];
    attachments.forEach(at => at.addOptionalProps(
      '', '/fallback', '#3AAF85'
    ));
    return attachments;
  }

  static providerRouteInformation(submission) {
    const {
      regNumber: registration, driverName, driverPhoneNumber,
      routeName, routeCapacity: capacity, takeOffTime,
    } = submission;
    const time = moment(takeOffTime, 'HH:mm').format('LT');
    const attachments = new SlackAttachment('');
    const fields = [
      new SlackAttachmentField('Driver Name', driverName, true),
      new SlackAttachmentField('Driver Phone Number', driverPhoneNumber, true),
      new SlackAttachmentField('Route Name', routeName, true),
      new SlackAttachmentField('Route Capacity', capacity, true),
      new SlackAttachmentField('*`Take-off Time`*', time, true),
      new SlackAttachmentField('Cab Registration Number', registration, true)
    ];
    attachments.addFieldsOrActions('fields', fields);
    return attachments;
  }
}

export default ProviderAttachmentHelper;
