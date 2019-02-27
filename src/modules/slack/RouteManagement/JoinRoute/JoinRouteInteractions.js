import handleActions from '../../SlackInteractions/SlackInteractionsHelper';
import {
  getPageNumber,
  triggerSkipPage
} from '../../TripManagement/TripItineraryController';
import SequelizePaginationHelper from '../../../../helpers/sequelizePaginationHelper';
import RoutesHelpers from '../../helpers/routesHelper';
import { SLACK_DEFAULT_SIZE } from '../../../../helpers/constants';
import RouteService from '../../../../services/RouteService';
import JoinRouteInputHandlers from './JoinRouteInputHandler';
import { bugsnagHelper } from '../rootFile';
import {
  SlackAttachment,
  SlackButtonAction,
  SlackInteractiveMessage
} from '../../SlackModels/SlackMessageModels';

class JoinRouteInteractions {
  static async sendAvailableRoutesMessage(payload, respond) {
    const { actions } = payload;
    const page = getPageNumber(payload);

    const sort = SequelizePaginationHelper.deserializeSort(
      'name,asc,batch,asc'
    );
    const pageable = { page, sort, size: SLACK_DEFAULT_SIZE };
    const where = { status: 'Active' };

    if (actions && actions[0].name === 'skipPage') {
      triggerSkipPage(payload, respond);
      return;
    }

    const {
      routes: availableRoutes,
      totalPages,
      pageNo: currentPage
    } = await RouteService.getRoutes(pageable, where);
    const availableRoutesMessage = RoutesHelpers.toAvailableRoutesAttachment(
      availableRoutes,
      currentPage,
      totalPages
    );
    respond(availableRoutesMessage);
  }

  static handleJoinRouteActions(payload, respond) {
    try {
      return handleActions(payload, respond, JoinRouteInputHandlers);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static fullRouteCapacityNotice(state) {
    const text = 'This route is filled up to capacity.'
      + ' By clicking continue, a notification will be sent to Ops '
      + 'and they will get back to you asap';
    const attachment = new SlackAttachment('', text);
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('showAvailableRoutes', '< Back', state, '#FFCCAA'),
      new SlackButtonAction('continueJoinRoute', 'Continue', state)
    ]);
    attachment.addOptionalProps('join_route_actions');
    return new SlackInteractiveMessage('Selected Full Capacity Route', [
      attachment
    ]);
  }
}

export default JoinRouteInteractions;
