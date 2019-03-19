import CabService from '../../services/CabService';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import BugsnagHelper from '../../helpers/bugsnagHelper';
import HttpError from '../../helpers/errorHandler';


class CabsController {
  static async createCab(req, res) {
    try {
      const {
        body: {
          driverName, driverPhoneNo, regNumber, capacity, model, location
        }
      } = req;
      const { _options: { isNewRecord } } = await CabService.findOrCreateCab(
        driverName, driverPhoneNo, regNumber, capacity, model, location
      );
      if (isNewRecord) {
        return res.status(201).json({
          success: true,
          message: 'You have successfully created a cab'
        });
      }
      const recordConflictError = {
        message: 'Cab registration or drivers number already exists'
      };
      HttpError.sendErrorResponse(recordConflictError, res);
    } catch (e) {
      BugsnagHelper.log(e);
      HttpError.sendErrorResponse({ message: 'Oops! Something went terribly wrong' }, res);
    }
  }

  static async getAllCabs(req, res) {
    try {
      let { page: pageRequest, size } = req.query;
      pageRequest = pageRequest || 1;
      size = size || defaultSize;
      const pageable = { pageRequest, size };
      const {
        totalPages,
        cabs,
        pageNo: page,
        totalItems: totalResults,
        itemsPerPage: pageSize
      } = await CabService.getCabs(pageable);

      const message = `${pageRequest} of ${totalPages} page(s).`;

      const pageData = {
        pageMeta: {
          totalPages, page, totalResults, pageSize
        },
        cabs
      };
      return Response.sendResponse(res, 200, true, message, pageData);
    } catch (error) {
      BugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default CabsController;
