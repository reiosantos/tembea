import {
  SlackInteractiveMessage,
  SlackAttachment, SlackButtonAction, SlackCancelButtonAction
} from '../SlackModels/SlackMessageModels';

class InteractivePrompts {
  static sendBookNewTripResponse(payload, respond) {
    const attachment = new SlackAttachment();
    attachment.addFieldsOrActions('actions', [
      // sample button actions
      new SlackButtonAction('yes', 'For Me', 'true'),
      new SlackButtonAction('no', 'For Someone', 'false'),
      new SlackCancelButtonAction()]);

    attachment.addOptionalProps('book_new_trip');

    const message = new SlackInteractiveMessage('Who are you booking for?', [attachment]);
    respond(message);
  }

  static sendCompletionResponse(payload, respond, requestId) {
    const requester = payload.user.id;
    const rider = payload.submission.rider || 'self';

    const attachment = new SlackAttachment();
    attachment.addFieldsOrActions('actions', [
      // sample button actions
      new SlackButtonAction('view', 'View', `${requester} ${rider}`),
      new SlackButtonAction('reschedule', 'Reschedule ', requestId),
      new SlackCancelButtonAction('Cancel Trip', requestId, 'Are you sure you want to cancel this trip', 'cancel_trip'),
      new SlackCancelButtonAction()
    ]);

    attachment.addOptionalProps('trip_itinerary');

    const message = new SlackInteractiveMessage('Success! Your request has been submitted.', [attachment]);
    respond(message);
  }

  static sendRescheduleCompletion(trip) {
    const attachments = new SlackAttachment();
    attachments.addFieldsOrActions('actions', [
      new SlackButtonAction('view', 'View', 'view'),
      new SlackButtonAction('reschedule', 'Reschedule ', trip.dataValues.id),
      new SlackCancelButtonAction('Cancel Trip', trip.dataValues.id, 'Are you sure you want to cancel this trip', 'cancel_trip'),
      new SlackCancelButtonAction()
    ]);
    attachments.addOptionalProps('trip_itinerary');
    return new SlackInteractiveMessage('Success! Your request has been submitted.', [attachments]);
  }

  static sendRescheduleError(trip) {
    const attachments = new SlackAttachment();
    attachments.addFieldsOrActions('actions', [
      new SlackButtonAction('reschedule', 'Try Again', trip.dataValues.id)
    ]);
    attachments.addOptionalProps('trip_itinerary');
    return new SlackInteractiveMessage('Oh! I was unable to save this trip', [attachments]);
  }

  static sendTripError() {
    return new SlackInteractiveMessage('Dang! I hit an error with this trip');
  }
}

export default InteractivePrompts;
