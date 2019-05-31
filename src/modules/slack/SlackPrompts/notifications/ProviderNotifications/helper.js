import moment from 'moment';
import AttachmentHelper from '../AttachmentHelper';
import {
  SlackAttachment,
  SlackAttachmentField
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
    const [driverName, driverPhoneNo] = driverDetails.split(',');
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
}

export default ProviderAttachmentHelper;
