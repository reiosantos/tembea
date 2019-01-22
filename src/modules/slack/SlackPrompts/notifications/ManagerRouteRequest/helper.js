import moment from 'moment';
import { SlackAttachment, SlackButtonAction } from '../../../SlackModels/SlackMessageModels';
import SlackNotifications from '../../Notifications';
import DateDialogHelper from '../../../../../helpers/dateHelper';
import AttachmentHelper from '../AttachmentHelper';

export default class ManagerAttachmentHelper {
  static getManagerCompleteAttachment(message, title, routeRequest, color = '#3359DF') {
    const footer = new SlackAttachment(message);
    const header = new SlackAttachment(title);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const engagementAttachment = AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [header, routeAttachment, engagementAttachment, footer];
    attachments.forEach(at => at.addOptionalProps(
      'manager_route_btnActions', '/fallback', color
    ));
    return attachments;
  }

  static getManagerMessageAttachment(routeRequest) {
    const { status, id, } = routeRequest;
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const engagementAttachment = AttachmentHelper.engagementAttachment(routeRequest);
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
    attachments.forEach(at => at.addOptionalProps(
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
  static getManagerApproveOrDeclineAttachment(routeRequest, channelID) {
    const { engagement: { fellow }, manager, status } = routeRequest;
    const data = AttachmentHelper.getStatusLabels(status);
    if (!data) return;
    const {
      action, emoji, title, color
    } = data;
    const attachment = new SlackAttachment(title);
    const comment = AttachmentHelper.commentAttachment(routeRequest);
    const routeAttachment = AttachmentHelper.routeRequestAttachment(routeRequest);
    const engagementAttachment = AttachmentHelper.engagementAttachment(routeRequest);
    const attachments = [attachment, comment, routeAttachment, engagementAttachment];
    attachments
      .filter(item => !!item)
      .forEach(at => at.addOptionalProps('manager_route_btnActions', '/fallback', color));
    const greeting = `Hi, <@${fellow.slackId}>`;
    return SlackNotifications.createDirectMessage(
      channelID,
      `${greeting}, your manager <@${manager.slackId}> ${action} your request ${emoji}`,
      attachments
    );
  }

  static completeManagerActionLabels(routeRequest) {
    const { status, engagement: { fellow } } = routeRequest;
    const confirmed = status === 'Confirmed';
    const declined = status === 'Declined';
    let title;
    let message;
    let text;
    let color;
    if (declined) {
      title = 'Route Request Declined';
      message = ':x: You have declined this route';
      text = `You have just declined <@${fellow.slackId}> route request`;
      color = '#FF0000';
    } else if (confirmed) {
      title = 'Route Request Confirmed';
      message = ':white_check_mark: You have confirmed this route';
      text = `You have just confirmed <@${fellow.slackId}> route request`;
      color = '#3359DF';
    }
    return {
      title, message, text, color
    };
  }

  static managerPreviewAttachment(routeRequest, value) {
    const { approve, startDate, endDate } = value;
    const sanitizedSD = DateDialogHelper.changeDateTimeFormat(startDate);
    const sanitizedED = DateDialogHelper.changeDateTimeFormat(endDate);
    const sdIsoDate = moment(sanitizedSD, 'MM-DD-YYYY')
      .toISOString();
    const edIsoDate = moment(sanitizedED, 'MM-DD-YYYY')
      .toISOString();
    const previewAttachment = new SlackAttachment('Confirm Engagement Information');

    let engagement = AttachmentHelper.engagementAttachmentFields(routeRequest);
    const engagementDateFields = AttachmentHelper.engagementDateFields(sdIsoDate, edIsoDate);
    engagement = engagement.concat(engagementDateFields);

    const actionsBtn = [
      new SlackButtonAction(
        'initialNotification', '< Back', JSON.stringify({ data: approve }), '#FFCCAA'
      ),
      new SlackButtonAction('approvedRequestEdit', 'Edit Information', JSON.stringify(value)),
      new SlackButtonAction('approvedRequestSubmit', 'Submit Information', JSON.stringify(value))
    ];
    previewAttachment.addFieldsOrActions('fields', [...engagement]);
    previewAttachment.addFieldsOrActions('actions', [...actionsBtn]);
    previewAttachment.addOptionalProps('manager_route_btnActions', '/fallback', '#dfc602');
    return previewAttachment;
  }
}
