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

  static SendCompletionResponse(payload, respond) {
    const requester = payload.user.id;
    const rider = payload.submission.rider || 'self';

    const attachment = new SlackAttachment();
    attachment.addActions([
      // sample button actions
      new SlackButtonAction('view', 'View', `${requester} ${rider}`),
      new SlackButtonAction('reschedule', 'Reschedule', `${requester} ${rider}`),
      new SlackCancelButtonAction(
        'Cancel', `${requester} ${rider}`, 'Do you really want to cancel this trip?'
      )
    ]);

    attachment.addOptionalProps('fallback', 'trip_itinerary', '#FFCCAA', 'default');

    const message = new SlackInteractiveMessage('Success! Your request has been submitted.', [attachment]);
    respond(message);
  }
}

export default InteractivePrompts;
