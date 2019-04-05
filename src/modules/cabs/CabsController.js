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
      const { _options: { isNewRecord }, dataValues } = await CabService.findOrCreateCab(
        driverName, driverPhoneNo, regNumber, capacity, model, location
      );
      if (isNewRecord) {
        return res.status(201).json({
          success: true,
          message: 'You have successfully created a cab',
          cab: dataValues
        });
      }
      const recordConflictError = {
        message: 'Cab registration or drivers number already exists',
        statusCode: 409
      };
      HttpError.sendErrorResponse(recordConflictError, res);
    } catch (e) {
      BugsnagHelper.log(e);
      HttpError.sendErrorResponse({ message: 'Oops! Something went terribly wrong' }, res);
    }
  }

  static async getAllCabs(req, res) {
    try {
      let { page, size } = req.query;
      page = page || 1;
      size = size || defaultSize;
      const {
        totalPages,
        cabs,
        pageNo,
        totalItems: totalResults,
        itemsPerPage: pageSize
      } = await CabService.getCabs({ page, size });

      const message = `${pageNo} of ${totalPages} page(s).`;
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

  static async updateCabDetails(req, res) {
    const { params: { id }, body } = req;
    try {
      const cab = await CabService.updateCab(id, body);
  
      if (cab.message) {
        return res.status(404).send({
          success: false,
          message: cab.message
        });
      }
      res.status(200).send({
        success: true,
        message: 'Cab details updated successfully',
        data: cab
      });
    } catch (error) {
      BugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default CabsController;
