import {
  SlackInteractiveMessage,
  SlackAttachment,
  SlackButtonAction,
  SlackCancelButtonAction
} from './SlackModels/SlackMessageModels';
import { isSlackSubCommand } from './helpers/slackHelpers/slackValidations';
import WebClientSingleton from '../../utils/WebClientSingleton';
import Response from '../../helpers/responseHelper';
import HttpError from '../../helpers/errorHandler';
import BugsnagHelper from '../../helpers/bugsnagHelper';


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
    const attachment = SlackController.greetings();

    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('book', 'Schedule a Trip', 'book_new_trip'),
      new SlackButtonAction(
        'view',
        'See Trip Itinerary',
        'view_trips_itinerary'
      ),
      new SlackCancelButtonAction()
    ]);

    attachment.addOptionalProps('welcome_message', '/fallback', '#3AA3E3');

    return new SlackInteractiveMessage('Welcome to Tembea!', [attachment]);
  }

  static getTravelCommandMsg() {
    const attachment = SlackController.greetings();

    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('Airport Transfer', 'Airport Transfer', 'airport_transfer'),
      new SlackButtonAction('Embassy Visit', 'Embassy Visit', 'embassy_visit'),
      new SlackCancelButtonAction()
    ]);
    attachment.addOptionalProps(
      'travel_trip_start',
      '/fallback',
      '#3AA3E3',
    );
    return new SlackInteractiveMessage('Welcome to Tembea!', [attachment]);
  }

  static getRouteCommandMsg() {
    const attachment = SlackController.greetings();

    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('Request New Route', 'Request New Route', 'request_new_route'),
      new SlackButtonAction('See Available Routes',
        'See Available Routes', 'view_available_routes'),
      new SlackCancelButtonAction()
    ]);
    attachment.addOptionalProps(
      'tembea_route',
      '/fallback',
      '#3AA3E3',
    );
    return new SlackInteractiveMessage('Welcome to Tembea!', [attachment]);
  }

  static handleSlackCommands(req, res, next) {
    const { body: { text } } = req;
    if (!text) return next();
    if (isSlackSubCommand((text.toLowerCase()), 'route')) {
      res.status(200)
        .json(SlackController.getRouteCommandMsg());
    } else if (isSlackSubCommand((text.toLowerCase()), 'travel')) {
      res.status(200)
        .json(SlackController.getTravelCommandMsg());
    }
  }

  /**
   * Fetch a list of slack channels on the workspace
   *
   * @static
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @returns {object} returns a response
   * @memberof SlackController
   */
  static async getChannels(req, res) {
    try {
      const { query: { type = 'private_channel' } } = req;
      const { locals: { slackAuthToken } } = res;

      const { channels } = await WebClientSingleton
        .getWebClient(slackAuthToken).conversations.list({
          types: type
        });
      const channelList = channels.map(({ id, name, purpose }) => ({
        id, name, description: purpose.value,
      }));
      return Response.sendResponse(res, 200, true, 'Request was successful', channelList);
    } catch (error) {
      BugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default SlackController;
