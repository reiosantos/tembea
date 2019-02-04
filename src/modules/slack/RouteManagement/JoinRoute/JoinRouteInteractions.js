import handleActions from '../../SlackInteractions/SlackInteractionsHelper';
import { getPageNumber, triggerSkipPage } from '../../TripManagement/TripItineraryController';
import SequelizePaginationHelper from '../../../../helpers/sequelizePaginationHelper';
import RoutesHelpers from '../../helpers/routesHelper';
import { SLACK_DEFAULT_SIZE } from '../../../../helpers/constants';
import RouteService from '../../../../services/RouteService';
import JoinRouteInputHandlers from './JoinRouteInputHandler';
import { bugsnagHelper } from '../rootFile';
import { SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';


class JoinRouteInteractions {
  static async sendAvailableRoutesMessage(payload, respond) {
    const page = getPageNumber(payload);
    const sort = SequelizePaginationHelper.deserializeSort('name,asc,batch,asc');
    const pageable = { page, sort, size: SLACK_DEFAULT_SIZE };
    const where = { status: 'Active' };
    triggerSkipPage(payload, respond);
    const {
      routes: availableRoutes, totalPages, pageNo: currentPage
    } = await RouteService.getRoutes(pageable, where);
    const availableRoutesMessage = RoutesHelpers.toAvailableRoutesAttachment(
      availableRoutes, currentPage, totalPages
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
}

export default JoinRouteInteractions;
