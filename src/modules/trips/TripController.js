import HttpError from '../../helpers/errorHandler';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import tripService, { TripService } from '../../services/TripService';

class TripController {
  static async getTrips(req, res) {
    try {
      const { query } = req;
      let { page, size } = query;
      page = page || 1;
      size = size || defaultSize;
      const where = TripService.sequelizeWhereClauseOption(query);
      const pageable = { page, size };
      const { totalPages, routes, pageNo } = await tripService.getTrips(
        pageable,
        where
      );
      const message = `${pageNo} of ${totalPages} page(s).`;
      const pageData = {
        pageMeta: {
          totalPages,
          page: pageNo,
          totalResults: routes.length,
          pageSize: parseInt(size, 10)
        },
        routes
      };
      return Response.sendResponse(res, 200, true, message, pageData);
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }
}
export default TripController;
