import SlackHelpers from '../../../helpers/slack/slackHelpers';
import Utils from '../../../utils/index';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction,
  SlackCancelButtonAction,
  SlackInteractiveMessage
} from '../SlackModels/SlackMessageModels';

class NotificationsResponse {
  static responseForOperationsChannel(data) {
    const channelId = process.env.OPERATIONS_DEPT_SLACK_CHANNEL_ID;
    const { requestId } = data;

    const actions = [
      new SlackButtonAction('confirmTrip', 'Confirm', requestId),
      new SlackCancelButtonAction('Decline', requestId,
        'Do you want to decline this request?', 'declineRequest')
    ];
    return NotificationsResponse.responseForOperations(
      data, actions, channelId, 'operations_approval'
    );
  }

  static responseForOperations(data, actions, channelId, callbackId) {
    const {
      department, requestDate, tripStatus
    } = data;
    const textArray = ['*Department:*', department, Utils.formatDate(requestDate)];

    const tripFormat = textArray.join(', ');
    const color = tripStatus && tripStatus
      .toLowerCase().startsWith('ca') ? '#EB3432' : undefined;

    return NotificationsResponse.prepareOperationsDepartmentResponse(
      channelId, tripFormat, data, color, actions, callbackId
    );
  }

  static prepareOperationsDepartmentResponse(
    channelId, tripFormat, responseData, color, actions, callbackId
  ) {
    const {
      tripStatus, requester, pickup, departureDate, rider, destination
    } = responseData;

    const title = rider.slackId !== requester.slackId
      ? `<@${requester.slackId}> has requested this ride for <@${rider.slackId}>`
      : `<@${requester.slackId}> has requested this ride.`;

    const detailedAttachment = new SlackAttachment(
      title, tripFormat, null, null, null, 'default', color
    );
    const fields = [
      new SlackAttachmentField('Pickup Location', pickup.address, true),
      new SlackAttachmentField('Destination', destination.address, true),
      new SlackAttachmentField('Departure', Utils.formatDate(departureDate), true),
      new SlackAttachmentField('Status', tripStatus, true)
    ];

    detailedAttachment.addFieldsOrActions('actions', actions);
    detailedAttachment.addFieldsOrActions('fields', fields);
    detailedAttachment.addOptionalProps(callbackId, 'fallback', undefined, 'default');

    return new SlackInteractiveMessage(
      '*Tembea* :oncoming_automobile:', [detailedAttachment], channelId
    );
  }

  static async responseForRequester(data, slackChannelId) {
    const {
      department, pickup, destination, requestDate, departureDate, tripStatus, managerComment
    } = data;

    const detailedAttachment = new SlackAttachment(
      'Approved',
      await NotificationsResponse.getMessageHeader(data), null, null, null, 'default', '#29b016'
    );

    const attachments = NotificationsResponse.getRequesterAttachment(
      department, data, slackChannelId, pickup, destination,
      requestDate, departureDate, tripStatus, managerComment
    );
    attachments.unshift(detailedAttachment);

    return new SlackInteractiveMessage(undefined, attachments, slackChannelId);
  }

  static getRequesterAttachment(
    department, data, slackChannelId, pickup, destination,
    requestDate, departureDate, tripStatus, managerComment
  ) {
    const detailedAttachment = new SlackAttachment(
      '*Trip Details*', null, null, null, null, 'default', '#29b016'
    );

    const fields = [
      new SlackAttachmentField('Pickup', pickup.address, true),
      new SlackAttachmentField('Destination', destination.address, true),
      new SlackAttachmentField('Request Date', Utils.formatDate(requestDate), true),
      new SlackAttachmentField('Departure Date', Utils.formatDate(departureDate), true),
      new SlackAttachmentField('Trip Status', tripStatus, true),
      new SlackAttachmentField('Reason', managerComment, true)
    ];
    detailedAttachment.addFieldsOrActions('fields', fields);

    return [detailedAttachment];
  }

  static async getMessageHeader(trip) {
    const { pickup, destination } = trip;

    const isApproved = await SlackHelpers.isRequestApproved(trip.id);

    return `Your request from *${pickup.address}* to *${destination.address
    }* has been approved by ${isApproved.approvedBy
    }. The request has now been forwarded to the operations team for confirmation.`;
  }
}

export default NotificationsResponse;
