import moment from 'moment';
import { SlackAttachment, SlackAttachmentField } from '../../SlackModels/SlackMessageModels';
import Utils from '../../../../utils/index';

export default class AttachmentHelper {
  static getStatusLabels(status, statusText = 'Confirmed') {
    let action;
    let emoji;
    let title;
    let color;
    if (status === 'Declined') {
      action = 'declined';
      emoji = ':cry:';
      title = 'Your route request was denied. See below for more information :point_down:';
      color = '#ff0000';
    } else if (status === statusText) {
      action = statusText.toLowerCase();
      emoji = ':grin:';
      title = '';
      color = '#3AAF85';
    }
    if (!action) return;
    return {
      action,
      emoji,
      title,
      color
    };
  }

  static commentAttachment(routeRequest) {
    const { managerComment, opsComment } = routeRequest;
    if (!managerComment && !opsComment) {
      return null;
    }

    const attachments = new SlackAttachment('');
    let commentField;
    if (managerComment) {
      commentField = new SlackAttachmentField('Comment', managerComment);
    } else {
      commentField = new SlackAttachmentField('Comment', opsComment);
    }
    attachments.addFieldsOrActions('fields', [commentField]);
    return attachments;
  }

  static routeRequestAttachment(routeRequest) {
    const { routeImageUrl, engagement } = routeRequest;
    const { email, name } = engagement.fellow;
    const fellowName = Utils.getNameFromEmail(email) || name;
    const attachments = new SlackAttachment(
      'Route Information', '', fellowName, '', (routeImageUrl) || ''
    );
    const routeAttachmentFields = AttachmentHelper.routeAttachmentFields(routeRequest);
    attachments.addFieldsOrActions('fields', routeAttachmentFields);
    return attachments;
  }

  static routeAttachmentFields(routeRequest) {
    const {
      busStop, home, distance, busStopDistance
    } = routeRequest;
    const busStopAddress = busStop.address;
    const homeAddress = home.address;
    return [
      new SlackAttachmentField(' ', null, false),
      new SlackAttachmentField(':house: Home Address', homeAddress, true),
      new SlackAttachmentField(':busstop: Bus Stop', busStopAddress, true),
      new SlackAttachmentField('Bus Stop Distance', null, false),
      new SlackAttachmentField('_From Home_', `${busStopDistance}km`, true),
      new SlackAttachmentField('_From Dojo_', `${distance}km`, true),
      new SlackAttachmentField(' ', null, false),
    ];
  }

  static engagementAttachment(routeRequest) {
    const attachments = new SlackAttachment('Engagement Information');
    const engagementFields = AttachmentHelper.engagementAttachmentFields(routeRequest);
    attachments.addFieldsOrActions('fields', engagementFields);
    return attachments;
  }

  static engagementAttachmentFields(routeRequest) {
    const {
      partnerName, fellow, startDate, endDate, workHours
    } = AttachmentHelper.destructEngagementDetails(routeRequest);
    const { email, name } = fellow;
    const fellowName = Utils.getNameFromEmail(email) || name;
    const nameField = new SlackAttachmentField('Fellows Name', fellowName, true);
    const partnerField = new SlackAttachmentField('Partner', partnerName, true);
    const engagementDateFields = (AttachmentHelper.engagementDateFields(startDate, endDate));
    const { from, to } = Utils.formatWorkHours(workHours);
    const workHourLabelField = new SlackAttachmentField('Work Hours', null, false);
    const fromField = new SlackAttachmentField('_From_', from, true);
    const toField = new SlackAttachmentField('_To_', to, true);

    return [
      nameField, partnerField, ...engagementDateFields, workHourLabelField, fromField, toField
    ].filter(field => !!field);
  }

  /**
   *
   * @param {string} startDate - ISO Date string format
   * @param {string} endDate - ISO Date string format
   * @return {Array}
   */
  static engagementDateFields(startDate, endDate) {
    let fields = [];
    if (startDate && endDate) {
      const sdDate = moment(startDate);
      const edDate = moment(endDate);
      const format = 'Do, MMMM YYYY';
      const edFormatted = edDate.format(format);
      const sdFormatted = sdDate.format(format);
      fields = [
        new SlackAttachmentField('Engagement Period', null, false),
        new SlackAttachmentField('_Start Date_', sdFormatted, true),
        new SlackAttachmentField('_End Date_', edFormatted, true)
      ];
    }
    return fields;
  }

  static destructEngagementDetails(routeRequest) {
    const { engagement } = routeRequest;
    const {
      partner: { name: partnerName }, fellow, startDate, endDate, workHours
    } = engagement;
    return {
      partnerName,
      fellow,
      startDate,
      endDate,
      workHours
    };
  }
}
