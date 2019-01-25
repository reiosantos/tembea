import moment from 'moment';
import { SlackAttachment, SlackAttachmentField } from '../../../SlackModels/SlackMessageModels';
import SlackNotifications from '../../Notifications';
import AttachmentHelper from '../AttachmentHelper';

export default class OpsAttachmentHelper {
  static getOperationDeclineAttachment(routeRequest, channelID, user = 'manager') {
    const { engagement: { fellow }, status, manager: { slackId: id } } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status);
    const slackUserId = user === 'manager' ? id : fellow.slackId;
    if (!data) return;
    const {
      action, emoji, title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const comment = AttachmentHelper.commentAttachment(routeRequest);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest, 'ops');
    const engagementAttachment = AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [attachment, comment, routeAttachment, engagementAttachment];
    attachments
      .filter(item => !!item)
      .forEach(at => at.addOptionalProps('operations_route_actions', '/fallback', color));
    const baseMsg = `Hi, <@${slackUserId}>, the operations team has ${action}`;
    const greetingFellow = `${baseMsg} your request ${emoji}`;
    const greetingManager = `${baseMsg} the request you approved for <@${fellow.slackId}> ${emoji}`;
    const greeting = user === 'manager' ? greetingManager : greetingFellow;
    return SlackNotifications.createDirectMessage(
      channelID,
      greeting,
      attachments
    );
  }

  static getManagerApproveAttachment(routeRequest, channelID, submission) {
    const { engagement: { fellow }, manager, status } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status, 'Approved');
    if (!data) return;
    const {
      action, emoji, title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const routeInformation = OpsAttachmentHelper.opsRouteInformation(submission);
    const engagementAttachment = AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [
      attachment, routeAttachment, engagementAttachment, routeInformation
    ];
    attachments
      .filter(item => !!item)
      .forEach(at => at.addOptionalProps('', '/fallback', color));
    const greeting = `Hi, <@${manager.slackId}>`;
    return SlackNotifications.createDirectMessage(
      channelID,
      `${greeting}, the route request you confirmed for 
      <@${fellow.slackId}> has been ${action} ${emoji}`,
      attachments
    );
  }

  static getFellowApproveAttachment(routeRequest, channelID, submission) {
    const { engagement: { fellow }, status } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status, 'Approved');
    if (!data) return;
    const {
      action, emoji, title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const routeInformation = OpsAttachmentHelper.opsRouteInformation(submission);
    const engagementAttachment = AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [
      attachment, routeAttachment, engagementAttachment, routeInformation
    ];
    attachments
      .filter(item => !!item)
      .forEach(at => at.addOptionalProps('', '/fallback', color));
    const greeting = `Hi, <@${fellow.slackId}>`;
    return SlackNotifications.createDirectMessage(
      channelID,
      `${greeting}, the operations team ${action} your request ${emoji}`,
      attachments
    );
  }

  static getOperationCompleteAttachment(message, title, routeRequest, submission) {
    const footer = new SlackAttachment(message);
    const header = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const routeInformation = OpsAttachmentHelper.opsRouteInformation(submission);
    const engagementAttachment = AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [header, routeAttachment, engagementAttachment, routeInformation, footer];
    attachments.forEach(at => at.addOptionalProps(
      '', '/fallback', '#3AAF85'
    ));
    return attachments;
  }

  static opsRouteInformation(submission) {
    const {
      routeName, routeCapacity, takeOffTime, regNumber
    } = submission;
    const time = moment(takeOffTime, 'HH:mm').format('LT');
    const attachments = new SlackAttachment('');
    const fields = [
      new SlackAttachmentField('Route Name', routeName, true),
      new SlackAttachmentField('Route Capacity', routeCapacity, true),
      new SlackAttachmentField('Take-off Time', time, true),
      new SlackAttachmentField('Cab Registration Number', regNumber, true)
    ];
    attachments.addFieldsOrActions('fields', fields);
    return attachments;
  }
}
