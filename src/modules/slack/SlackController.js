import {
  SlackInteractiveMessage,
  SlackAttachment,
  SlackButtonAction,
  SlackCancelButtonAction
} from './SlackModels/SlackMessageModels';
import { isSlackSubCommand } from './helpers/slackHelpers/slackValidations';

class SlackController {
  static launch(req, res) {
    const message = SlackController.getWelcomeMessage();
    return res.status(200).json(message);
  }

  static greetings() {
    return new SlackAttachment(
      'I am your trip operations assistant at Andela',
      'What would you like to do today?',
      'Tembea',
      '',
      ''
    );
  }

  static getWelcomeMessage() {
    const attachment = this.greetings();

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

  static travel(req, res, next) {
    return (req.body.text && isSlackSubCommand((req.body.text.toLowerCase()), 'travel') ? res.status(200).json(SlackController.getTravelCommandMsg()) : next());
  }

  static getTravelCommandMsg() {
    const attachment = this.greetings();
  
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('book', 'Airport Transfer', 'airport_transfer'),
      new SlackButtonAction('book', 'Embassy Visit', 'embassy_visit'),
      new SlackCancelButtonAction()
    ]);

    attachment.addOptionalProps(
      'travel_actions',
      '/fallback',
      '#3AA3E3',
    );
    return new SlackInteractiveMessage('Welcome to Tembea!', [attachment]);
  }
}

export default SlackController;
