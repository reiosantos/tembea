import CabService from '../../services/CabService';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import BugsnagHelper from '../../helpers/bugsnagHelper';
import HttpError from '../../helpers/errorHandler';
import ProviderHelper from '../../helpers/providerHelper';

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
      const pageData = ProviderHelper.paginateData(totalPages, page, totalResults, pageSize, cabs, 'cabs');
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

  static async deleteCab(req, res) {
    try {
      const { params: { id } } = req;
      const dbResponse = await CabService.deleteCab(id);
      if (dbResponse > 0) {
        const message = 'Cab successfully deleted';
        return Response.sendResponse(res, 200, true, message);
      }
      const doesNotExist = {
        message: 'Cab does not exist',
        statusCode: 404
      };
      HttpError.sendErrorResponse(doesNotExist, res);
    } catch (e) {
      BugsnagHelper.log(e);
      const serverError = {
        message: 'Server Error. Could not complete the request',
        statusCode: 500
      };
      HttpError.sendErrorResponse(serverError, res);
    }
  }
}

export default CabsController;
