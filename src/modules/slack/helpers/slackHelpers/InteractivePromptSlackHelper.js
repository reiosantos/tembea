import {
  SlackInteractiveMessage, SlackAttachment, SlackButtonAction,
  SlackCancelButtonAction,
  SlackAttachmentField,
} from '../../SlackModels/SlackMessageModels';
import { getSlackDateString } from '../dateHelpers';


class InteractivePromptSlackHelper {
  static sendTripError() {
    return new SlackInteractiveMessage('Dang! I hit an error with this trip');
  }

  static passedTimeOutLimit() {
    return new SlackInteractiveMessage(
      'Sorry! This trip cant be rescheduled one hour prior the pick-up time'
    );
  }

  static rescheduleConfirmedApprovedError() {
    return new SlackInteractiveMessage(
      'Sorry! This trip has been approved and cannot be rescheduled but cancelled.'
    );
  }

  static sendCancelRequestResponse(respond) {
    const message = new SlackInteractiveMessage(
      'Thank you for using Tembea. Your request has been cancelled'
    );
    respond(message);
  }

  static sendError(
    message = 'Dang! I hit an error with this request. Please contact Tembea Technical support'
  ) {
    return new SlackInteractiveMessage(message);
  }

  static sendCompletionResponse(respond, requestId, riderId) {
    const attachment = new SlackAttachment();
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('view', 'View', requestId),
      new SlackButtonAction('reschedule', 'Reschedule ', requestId),
      new SlackCancelButtonAction(
        'Cancel Trip', requestId,
        'Are you sure you want to cancel this trip', 'cancel_trip'
      ),
      new SlackCancelButtonAction()
    ]);

    attachment.addOptionalProps('itinerary_actions');
    const message = new SlackInteractiveMessage(
      `Success! Trip request for <@${riderId}> has been submitted.`,
      [attachment]
    );
    respond(message);
  }

  static sendRescheduleCompletion(trip, riderId) {
    const attachments = new SlackAttachment();
    attachments.addFieldsOrActions('actions', [
      new SlackButtonAction('view', 'View', trip.id),
      new SlackButtonAction('reschedule', 'Reschedule ', trip.id),
      new SlackCancelButtonAction(
        'Cancel Trip', trip.id,
        'Are you sure you want to cancel this trip', 'cancel_trip'
      ),
      new SlackCancelButtonAction()
    ]);
    attachments.addOptionalProps('itinerary_actions');
    return new SlackInteractiveMessage(
      `Success! Trip request for <@${riderId}> has been submitted.`, [attachments]
    );
  }

  static sendRescheduleError(tripId) {
    const attachments = new SlackAttachment();
    attachments.addFieldsOrActions('actions', [
      new SlackButtonAction('reschedule', 'Try Again', tripId)
    ]);
    attachments.addOptionalProps('itinerary_actions');
    return new SlackInteractiveMessage('Sorry! I was unable to save this trip', [
      attachments
    ]);
  }

  static formatUpcomingTrip(trip, payload, attachments) {
    const { id } = payload.user;
    const attachment = new SlackAttachment();
    const journey = `From ${trip['origin.address']} To ${trip['destination.address']}`;
    const time = `Departure Time:  ${getSlackDateString(trip.departureTime)}`;
    const requestedBy = id === trip['requester.slackId']
      ? `Requested By: ${trip['requester.name']} (You)`
      : `Requested By: ${trip['requester.name']}`;

    const rider = id !== trip['rider.slackId'] || id !== trip['requester.slackId']
      ? `Rider: ${trip['rider.name']}`
      : null;

    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(journey, time)]);
    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(requestedBy, rider)]);
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('reschedule', 'Reschedule ', trip.id),
      new SlackCancelButtonAction(
        'Cancel Trip', trip.id,
        'Are you sure you want to cancel this trip', 'cancel_trip'
      )
    ]);
    attachment.addOptionalProps('itinerary_actions');
    attachments.push(attachment);
    return attachments;
  }

  static openDestinationDialog() {
    const attachment = new SlackAttachment(
      '',
      '',
      '', '', '', 'default', 'warning'
    );
    const actions = [
      new SlackButtonAction('openDestination', 'Select Destination', 'destination'),
      new SlackCancelButtonAction(
        'Cancel Travel Request',
        'cancel',
        'Are you sure you want to cancel this travel request',
        'cancel_request'
      )
    ];
    attachment.addFieldsOrActions('actions', actions);
    attachment.addOptionalProps('travel_trip_destinationSelection',
      'fallback', undefined, 'default');
    const message = new SlackInteractiveMessage('*Travel Trip Request *', [
      attachment
    ]);
    return message;
  }
}

export default InteractivePromptSlackHelper;
