import moment from 'moment';
import AttachmentHelper from '../AttachmentHelper';
import {
  SlackAttachment,
  SlackAttachmentField
} from '../../../SlackModels/SlackMessageModels';
import SlackNotifications from '../../Notifications';

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
    const attachments = [
      attachment, routeAttachment, routeInformation
    ];
    attachments.filter(item => !!item).forEach(at => at.addOptionalProps('', '/fallback', color));
    return SlackNotifications.createDirectMessage(
      channelID,
      'Hi :smiley:, you have received a route request, please assign a cab and a driver',
      attachments
    );
  }

  static routeInfoAttachment(submission) {
    const { routeName, takeOffTime } = submission;
    const time = moment(takeOffTime, 'HH:mm').format('LT');
    const attachments = new SlackAttachment('');
    const fields = [
      new SlackAttachmentField('Route Name', routeName, true),
      new SlackAttachmentField('Take-off Time', time, true),
    ];
    attachments.addFieldsOrActions('fields', fields);
    return attachments;
  }
}

export default ProviderAttachmentHelper;
