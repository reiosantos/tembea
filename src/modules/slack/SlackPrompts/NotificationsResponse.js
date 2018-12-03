import SlackHelpers from '../../../helpers/slack/slackHelpers';
import Utils from '../../../utils/index';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction,
  SlackInteractiveMessage
} from '../SlackModels/SlackMessageModels';

class NotificationsResponse {
  static responseForOperationsChannel(data, payload) {
    const channelId = process.env.OPERATIONS_DEPT_SLACK_CHANNEL_ID;
    const { id } = data;

    const actions = [
      new SlackButtonAction('confirmTrip', 'Confirm', id),
      new SlackButtonAction('declineRequest', 'Decline', id, 'danger')
    ];
    return NotificationsResponse.responseForOperations(
      data, actions, channelId, 'operations_approval', payload
    );
  }

  static responseForOperations(data, actions, channelId, callbackId, payload) {
    const { tripStatus } = data;

    // const tripFormat = textArray.join(', ');
    const color = tripStatus && tripStatus
      .toLowerCase().startsWith('ca') ? '#EB3432' : undefined;

    return NotificationsResponse.prepareOperationsDepartmentResponse(
      channelId, data, color, actions, callbackId, payload
    );
  }

  static prepareOperationsDepartmentResponse(
    channelId, responseData, color, actions, callbackId, payload
  ) {
    const {
      tripStatus, requester, pickup, departureDate, rider, destination, managerComment, department
    } = responseData;
    const riderInfo = rider.slackId !== requester.slackId
      ? `<@${requester.slackId}> requested a trip for <@${rider.slackId}>`
      : `<@${requester.slackId}> requested a trip`;

    const detailedAttachment = new SlackAttachment(
      'Manager approved trip request', riderInfo, null, null, null, 'default', color
    );
    const fields = [
      new SlackAttachmentField('Rider', `<@${requester.slackId}>`, true),
      new SlackAttachmentField('Department', `<@${department}>`, true),
      new SlackAttachmentField('Pickup Location', pickup.address, true),
      new SlackAttachmentField('Destination', destination.address, true),
      new SlackAttachmentField('Departure', Utils.formatDate(departureDate), true),
      new SlackAttachmentField('Status', tripStatus, true),
      new SlackAttachmentField('Manager Comment', managerComment)
    ];

    detailedAttachment.addFieldsOrActions('actions', actions);
    detailedAttachment.addFieldsOrActions('fields', fields);
    detailedAttachment.addOptionalProps(callbackId, 'fallback', undefined, 'default');

    return new SlackInteractiveMessage(
      `<@${payload.user.id}> just approved this trip. Its ready for your action :smiley:`, [detailedAttachment], channelId
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
