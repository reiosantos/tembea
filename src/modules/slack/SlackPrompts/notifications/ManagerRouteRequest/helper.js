import { SlackAttachment, SlackButtonAction } from '../../../SlackModels/SlackMessageModels';
import SlackNotifications from '../../Notifications';
import AttachmentHelper from '../AttachmentHelper';

export default class ManagerAttachmentHelper {
  static async getManagerCompleteAttachment(message, title, routeRequest, color = '#3359DF') {
    const footer = new SlackAttachment(message);
    const header = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const engagementAttachment = await AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [header, routeAttachment, engagementAttachment, footer];
    attachments.forEach((at) => at.addOptionalProps(
      'manager_route_btnActions', '/fallback', color
    ));
    return attachments;
  }

  static async getManagerMessageAttachment(routeRequest) {
    const { status, id, } = routeRequest;
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const engagementAttachment = await AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [routeAttachment, engagementAttachment];
    if (status === 'Pending') {
      const btnAttachment = new SlackAttachment('');
      const actions = [
        new SlackButtonAction('approve', 'Approve', id),
        new SlackButtonAction('decline', 'Decline', id, 'danger')
      ];
      btnAttachment.addFieldsOrActions('actions', actions);
      attachments.push(btnAttachment);
    } else {
      const { message } = ManagerAttachmentHelper.completeManagerActionLabels(routeRequest);
      const footer = new SlackAttachment(message);
      attachments.push(footer);
    }
    attachments.forEach((at) => at.addOptionalProps(
      'manager_route_btnActions', '/fallback', '#3359DF'
    ));
    return attachments;
  }

  /**
   *
   * @param routeRequest
   * @param channelID
   * @return {{channel, text, attachments}}
   */
  static async getManagerApproveOrDeclineAttachment(routeRequest, channelID) {
    const { engagement: { fellow }, manager, status } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status);
    if (!data) return;
    const {
      action, emoji, title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const comment = AttachmentHelper.commentAttachment(routeRequest);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const engagementAttachment = await AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [attachment, comment, routeAttachment, engagementAttachment];
    attachments
      .filter((item) => !!item)
      .forEach((at) => at.addOptionalProps('manager_route_btnActions', '/fallback', color));
    const greeting = `Hi, <@${fellow.slackId}>`;
    return SlackNotifications.createDirectMessage(
      channelID,
      `${greeting}, your manager <@${manager.slackId}> ${action} your request ${emoji}`,
      attachments
    );
  }

  static labelsHelper(status, fellow) {
    const lowerStatus = status.toLowerCase();
    const emoji = status === 'Confirmed' ? ':white_check_mark:' : ':x:';
    const title = `Route Request ${status}`;
    const message = `${emoji} You have ${lowerStatus} this route`;
    const text = `You have just ${lowerStatus} <@${fellow.slackId}> route request`;
    const color = status === 'Confirmed' ? '#3359DF' : '#FF0000';

    return {
      title, message, text, color
    };
  }

  static completeManagerActionLabels(routeRequest) {
    const { status, engagement: { fellow } } = routeRequest;
    let title;
    let message;
    let text;
    let color;
    if (status === 'Confirmed' || status === 'Declined') {
      ({
        title, message, text, color
      } = this.labelsHelper(status, fellow));
    }
    return {
      title, message, text, color
    };
  }

  static async managerPreviewAttachment(routeRequest, value) {
    const { approve } = value;
    const previewAttachment = new SlackAttachment('Confirm Engagement Information');

    const engagement = await AttachmentHelper.engagementAttachmentFields(routeRequest);

    const actionsBtn = [
      new SlackButtonAction(
        'initialNotification', '< Back', JSON.stringify({ data: approve }), '#FFCCAA'
      ),
      new SlackButtonAction('approvedRequestSubmit', 'Submit Information', JSON.stringify(value))
    ];
    previewAttachment.addFieldsOrActions('fields', [...engagement]);
    previewAttachment.addFieldsOrActions('actions', [...actionsBtn]);
    previewAttachment.addOptionalProps('manager_route_btnActions', '/fallback', '#dfc602');
    return previewAttachment;
  }
}
