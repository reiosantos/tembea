import RoutesHelpers from '../../helpers/routesHelper';
import RouteService from '../../../../services/RouteService';
import { SLACK_DEFAULT_SIZE } from '../../../../helpers/constants';
import SequelizePaginationHelper from '../../../../helpers/sequelizePaginationHelper';
import { getPageNumber, triggerSkipPage } from '../../TripManagement/TripItineraryController';

export default class JoinRouteInputHandlers {
  static async sendAvailableRoutesMessage(payload, respond) {
    const page = getPageNumber(payload);

    const sort = SequelizePaginationHelper.deserializeSort('name,asc,batch,asc');
    const pageable = { page, sort, size: SLACK_DEFAULT_SIZE };
    const where = { status: 'Active' };

    triggerSkipPage(payload, respond);
    const { routes: availableRoutes, totalPages, pageNo: currentPage } = await RouteService.getRoutes(pageable, where);
    const availableRoutesMessage = RoutesHelpers.toAvailableRoutesAttachment(availableRoutes, currentPage, totalPages);
    respond(availableRoutesMessage);
  }
}
