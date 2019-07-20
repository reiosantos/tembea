import AttachmentHelper from '../AttachmentHelper';
import { SlackAttachment } from '../../../SlackModels/SlackMessageModels';
import SlackNotifications from '../../Notifications';
import OpsAttachmentHelper from '../OperationsRouteRequest/helper';

export default class RouteNotificationsHelper {
  static async getManagerApproveAttachment(routeRequest, channelID, managerStatus, submission) {
    const { engagement: { fellow }, manager, status } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status, 'Approved');
    if (!data) return;
    const {
      action, emoji, title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const engagementAttachment = await AttachmentHelper.engagementAttachment(routeRequest);
    const routeInformation = OpsAttachmentHelper.opsRouteInformation(submission);
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
    const engagementAttachment = await AttachmentHelper.engagementAttachment(routeRequest);
    const routeInformation = OpsAttachmentHelper.opsRouteInformation(submission);
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
}
