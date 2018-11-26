import {
  SlackInteractiveMessage,
  SlackAttachment,
  SlackButtonAction,
  SlackCancelButtonAction
} from './SlackModels/SlackMessageModels';

class SlackController {
  static launch(req, res) {
    const message = SlackController.getWelcomeMessage();
    return res.status(200).json(message);
  }

  static getWelcomeMessage() {
    const attachment = new SlackAttachment(
      'I am your trip operations assistant at Andela',
      'What would you like to do today?',
      'Tembea',
      '',
      ''
    );

    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('book', 'Schedule a Trip', 'book_new_trip'),
      new SlackButtonAction(
        'view',
        'See Trip Itinerary',
        'view_trips_itinerary'
      ),
      new SlackButtonAction(
        'view',
        'See Available Routes',
        'view_available_routes'
      ),
      new SlackCancelButtonAction()
    ]);

    attachment.addOptionalProps(
      'welcome_message',
      '/fallback',
      '#3AA3E3',
    );

    return new SlackInteractiveMessage('Welcome to Tembea!', [attachment]);
  }
}

export default SlackController;
