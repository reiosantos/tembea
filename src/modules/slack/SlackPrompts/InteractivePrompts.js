import {
  SlackInteractiveMessage,
  SlackAttachment, SlackButtonAction, SlackCancelButtonAction
} from '../SlackModels/SlackMessageModels';

class InteractivePrompts {
  static SendBookNewTripResponse(payload, respond) {
    const attachment = new SlackAttachment();
    attachment.addActions([
      // sample button actions
      new SlackButtonAction('yes', 'For Me', 'true'),
      new SlackButtonAction('no', 'For Someone', 'false'),
      new SlackCancelButtonAction()]);

    attachment.addOptionalProps('fallback', 'book_new_trip', '#FFCCAA', 'default');

    const message = new SlackInteractiveMessage('Who are you booking for?', [attachment]);
    respond(message);
  }

  static SendCompletionResponse(payload, respond, requestId) {
    const requester = payload.user.id;
    const rider = payload.submission.rider || 'self';

    const attachment = new SlackAttachment();
    attachment.addActions([
      // sample button actions
      new SlackButtonAction('view', 'View', `${requester} ${rider}`),
      new SlackButtonAction('reschedule', 'Reschedule ', requestId),
      new SlackCancelButtonAction(
        'Cancel', `${requester} ${rider}`, 'Do you really want to cancel this trip?'
      )
    ]);

    attachment.addOptionalProps('fallback', 'trip_itinerary', '#FFCCAA', 'default');

    const message = new SlackInteractiveMessage('Success! Your request has been submitted.', [attachment]);
    respond(message);
  }

  static SendRescheduleCompletion(trip) {
    const attachments = new SlackAttachment();
    attachments.addActions([
      new SlackButtonAction('view', 'View', 'view'),
      new SlackButtonAction('reschedule', 'Reschedule ', trip.dataValues.id),
      new SlackCancelButtonAction(
        'Cancel', trip.dataValues.id, 'Do you really want to cancel this trip?'
      )
    ]);
    attachments.addOptionalProps('fallback', 'trip_itinerary', '#FFCCAA', 'default');
    return new SlackInteractiveMessage(`The trip has been rescheduled for ${trip.departureTime}`, [attachments]);
  }
  
  static SendRescheduleError(trip) {
    const attachments = new SlackAttachment();
    attachments.addActions([
      new SlackButtonAction('reschedule', 'Try Again', trip.dataValues.id)
    ]);
    attachments.addOptionalProps('fallback', 'trip_itinerary', '#FFCCAA', 'default');
    return new SlackInteractiveMessage('Oh! I was unable to save this trip', [attachments]);
  }

  static SendTripError() {
    return new SlackInteractiveMessage('Dang! I hit an error with this trip');
  }
}

export default InteractivePrompts;
