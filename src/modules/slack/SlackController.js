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
import HomebaseService from '../../services/HomebaseService';
import SlackHelpers from '../../helpers/slack/slackHelpers';
import UserService from '../../services/UserService';
import RouteService from '../../services/RouteService';

class SlackController {
  static async launch(req, res) {
    const { body: { user_id: slackId } } = req; // get slack id from req, payload.
    const message = await SlackController.getWelcomeMessage(slackId);
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

  static createChangeLocationBtn(callback) {
    return new SlackButtonAction(
      `changeLocation${callback ? '__'.concat(callback) : ''}`,
      'Change Location',
      'change_location'
    );
  }

  static async getHomeBaseMessage(slackId) {
    const homeBase = await HomebaseService.getHomeBaseBySlackId(slackId, true);
    const homeBaseMessage = homeBase
      ? `_Your current home base is ${SlackHelpers.getLocationCountryFlag(homeBase.country.name)} *${homeBase.name}*_`
      : '`Please set your location to continue`';
    return homeBaseMessage;
  }

  static async getWelcomeMessage(slackId) {
    const attachment = SlackController.greetings();
    const homeBaseMessage = await SlackController.getHomeBaseMessage(slackId);
    const actions = homeBaseMessage !== '`Please set your location to continue`' ? [
      new SlackButtonAction('book', 'Schedule a Trip', 'book_new_trip'),
      new SlackButtonAction(
        'view',

        'See Trip Itinerary',
        'view_trips_itinerary'
      )
    ] : [];
    attachment.addFieldsOrActions('actions', [
      ...actions,
      SlackController.createChangeLocationBtn(''),
      new SlackCancelButtonAction()
    ]);

    attachment.addOptionalProps('welcome_message', '/fallback', '#3AA3E3');

    return new SlackInteractiveMessage(`Welcome to Tembea! \n ${homeBaseMessage}`, [attachment]);
  }

  static async getTravelCommandMsg(slackId) {
    const homeBaseMessage = await SlackController.getHomeBaseMessage(slackId);

    const attachment = SlackController.greetings();
    const actions = homeBaseMessage !== '`Please set your location to continue`'
      ? [new SlackButtonAction('Airport Transfer', 'Airport Transfer', 'airport_transfer'),
        new SlackButtonAction('Embassy Visit', 'Embassy Visit', 'embassy_visit'),
      ] : [];

    attachment.addFieldsOrActions('actions', [
      ...actions,
      SlackController.createChangeLocationBtn('travel'),
      new SlackCancelButtonAction()
    ]);

    attachment.addOptionalProps(
      'travel_trip_start',
      '/fallback',
      '#3AA3E3',
    );

    return new SlackInteractiveMessage(`Welcome to Tembea! \n ${homeBaseMessage}`, [attachment]);
  }

  static async getRouteCommandMsg(slackId) {
    const homeBaseMessage = await SlackController.getHomeBaseMessage(slackId);
    if (!homeBaseMessage.includes('Nairobi') && homeBaseMessage !== '`Please set your location to continue`') {
      return new SlackInteractiveMessage(
        '>*`The route functionality is not supported for your current location`*'
          .concat('\nThank you for using Tembea! See you again.')
      );
    }
    const attachment = SlackController.greetings();
    const actions = homeBaseMessage !== '`Please set your location to continue`'
      ? [
        new SlackButtonAction('My Current Route',
          'My Current Route', 'my_current_route'),
        new SlackButtonAction('Request New Route', 'Request New Route', 'request_new_route'),
        new SlackButtonAction('See Available Routes',
          'See Available Routes', 'view_available_routes'),

      ] : [];
    attachment.addFieldsOrActions('actions', [
      ...actions,
      SlackController.createChangeLocationBtn('routes'),
      new SlackCancelButtonAction()
    ]);
    attachment.addOptionalProps(
      'tembea_route',
      '/fallback',
      '#3AA3E3',
    );

    return new SlackInteractiveMessage(`Welcome to Tembea! \n ${homeBaseMessage}`, [attachment]);
  }

  static async handleSlackCommands(req, res, next) {
    const { body: { text, user_id: slackId, team_id: teamId } } = req;
    await SlackHelpers.findOrCreateUserBySlackId(slackId, teamId);
    if (!text) return next();
    if (isSlackSubCommand((text.toLowerCase()), 'route')) {
      const response = await SlackController.getRouteCommandMsg(slackId);

      res.status(200)
        .json(response);
    } else if (isSlackSubCommand((text.toLowerCase()), 'travel')) {
      const response = await SlackController.getTravelCommandMsg(slackId);
      res.status(200)
        .json(response);
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
      const { locals: { botToken } } = res;

      const { channels } = await WebClientSingleton
        .getWebClient(botToken).conversations.list({
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

  static async leaveRoute(payload, respond) {
    try {
      const { user: { id } } = payload;
      const { dataValues: { routeBatchId, name, id: userId } } = await UserService.getUserBySlackId(id);
      if (routeBatchId) {
        await UserService.updateUser(userId, { routeBatchId: null });
        const { routeId } = await RouteService.getRouteBatchByPk(routeBatchId, false);
        const { name: routeName } = await RouteService.getRouteById(routeId, false);
        const slackMessage = new SlackInteractiveMessage(
          `Hey *${name}*, You have successfully left the route \`${routeName}\`.`
        );
        respond(slackMessage);
      }
    } catch (error) {
      BugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Something went wrong! Please try again.'));
    }
  }
}

export default SlackController;
