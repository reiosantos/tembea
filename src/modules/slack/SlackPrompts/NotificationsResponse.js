import SlackHelpers from '../../../helpers/slack/slackHelpers';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction,
  SlackInteractiveMessage,
  SlackSelectAction
} from '../SlackModels/SlackMessageModels';
import { getSlackDateString, checkBeforeSlackDateString } from '../helpers/dateHelpers';
import HomebaseService from '../../../services/HomebaseService';
import { HOMEBASE_NAMES } from '../../../helpers/constants';

class NotificationsResponse {
  static async getRequestMessageForOperationsChannel(data, payload, channel, tripType) {
    const channelId = channel;
    const { id } = data;
    const { user: { id: slackId } } = payload;
    
    const actions = await NotificationsResponse.generateOperationsRequestActions(id, slackId);

    return NotificationsResponse.responseForOperations(
      data, actions, channelId, 'trips_cab_selection', payload, tripType
    );
  }

  static responseForOperations(data, actions, channelId, callbackId, payload, tripType) {
    const { tripStatus } = data;
    const color = tripStatus && tripStatus
      .toLowerCase().startsWith('ca') ? 'good' : undefined;

    if (tripType === 'regular') {
      return NotificationsResponse.prepareOperationsDepartmentResponse(
        channelId, data, color, actions, callbackId, payload
      );
    }

    return this.travelOperationsDepartmentResponse(
      channelId, data, color, actions, callbackId
    );
  }

  static riderInfoResponse(rider, requester) {
    const riderInfo = rider.slackId !== requester.slackId
      ? `<@${requester.slackId}> requested a trip for <@${rider.slackId}>`
      : `<@${requester.slackId}> requested a trip`;
    return riderInfo;
  }

  static travelOperationsDepartmentResponse(
    channelId, responseData, color, actions, callbackId
  ) {
    const {
      tripStatus, requester, pickup, departureTime, rider, destination,
      department, noOfPassengers, tripType, tripNote
    } = responseData;
    const riderInfo = this.riderInfoResponse(rider, requester);

    const detailedAttachment = new SlackAttachment(
      'Travel trip request', riderInfo, null, null, null, 'default', color
    );
    const fields = [
      new SlackAttachmentField('Passenger', `<@${rider.slackId}>`, true),
      new SlackAttachmentField('Department', department, true),
      new SlackAttachmentField('Pickup Location', pickup.address, true),
      new SlackAttachmentField('Destination', destination.address, true),
      new SlackAttachmentField('Pick-Up Time', getSlackDateString(departureTime), true),
      new SlackAttachmentField('Number of Passengers', noOfPassengers, true),
      new SlackAttachmentField('Trip Type', tripType, true),
      new SlackAttachmentField('Status', tripStatus, true),
      new SlackAttachmentField('Trip Notes', !tripNote ? 'No Trip Notes' : tripNote, true),
    ];
    detailedAttachment.addFieldsOrActions('actions', actions);
    detailedAttachment.addFieldsOrActions('fields', fields);
    detailedAttachment.addOptionalProps(callbackId, '', undefined, 'default');

    return new SlackInteractiveMessage(
      '', [detailedAttachment], channelId
    );
  }

  static prepareOperationsDepartmentResponse(
    channelId, responseData, color, actions, callbackId, payload
  ) {
    const {
      tripStatus, requester, pickup, departureTime,
      rider, destination, managerComment, department
    } = responseData;

    const riderInfo = this.riderInfoResponse(rider, requester);

    const detailedAttachment = new SlackAttachment(
      'Manager approved trip request', riderInfo, null, null, null, 'default', color
    );
    const fields = [
      new SlackAttachmentField('Passenger', `<@${rider.slackId}>`, true),
      new SlackAttachmentField('Department', department, true),
      new SlackAttachmentField('Pickup Location', pickup.address, true),
      new SlackAttachmentField('Destination', destination.address, true),
      new SlackAttachmentField('Departure', checkBeforeSlackDateString(departureTime), true),
      new SlackAttachmentField('Status', tripStatus, true),
      new SlackAttachmentField('Manager Comment', managerComment)
    ];

    detailedAttachment.addFieldsOrActions('actions', actions);
    detailedAttachment.addFieldsOrActions('fields', fields);
    detailedAttachment.addOptionalProps(callbackId, 'fallback', undefined, 'default');

    return new SlackInteractiveMessage(
      `<@${payload.user.id}> just approved this trip. Its ready for your action :smiley:`,
      [detailedAttachment], channelId
    );
  }

  static async responseForRequester(data, slackChannelId) {
    const {
      department, pickup, destination, createdAt: requestDate,
      departureTime, tripStatus, managerComment
    } = data;

    const detailedAttachment = new SlackAttachment(
      'Approved',
      await NotificationsResponse.getMessageHeader(data), null, null, null, 'default', '#29b016'
    );

    const attachments = NotificationsResponse.getRequesterAttachment(
      department, data, slackChannelId, pickup, destination,
      requestDate, departureTime, tripStatus, managerComment
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
      new SlackAttachmentField('Request Date', getSlackDateString(requestDate), true),
      new SlackAttachmentField('Departure Date', getSlackDateString(departureDate), true),
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

  static async generateOperationsRequestActions(id, slackId) {
    const options = [
      {
        text: 'Confirm and assign Cab and Driver',
        value: `assignCab_${id}`,
      },
      {
        text: 'Confirm and assign provider',
        value: `confirmTrip_${id}`,
      }
    ];
    const selectAction = await NotificationsResponse.getOpsSelectAction(slackId, id, options);
    const actions = [
      selectAction,
      new SlackButtonAction('declineRequest', 'Decline', id, 'danger')
    ];
    return actions;
  }

  static async getOpsSelectAction(slackId, id, options) {
    let selectAction = new SlackSelectAction(
      'assign-cab-or-provider',
      'Confirm request options',
      options
    );

    const { name } = await HomebaseService.getHomeBaseBySlackId(slackId);

    if (name === HOMEBASE_NAMES.KAMPALA) {
      selectAction = new SlackButtonAction(
        'assign-cab-or-provider',
        'Confirm and assign cab and driver',
        `assignCab_${id}`
      );
    }
    return selectAction;
  }
}

export default NotificationsResponse;
