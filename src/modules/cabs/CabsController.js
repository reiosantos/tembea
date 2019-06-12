import { cabService } from '../../services/CabService';
import Response, { getPaginationMessage } from '../../helpers/responseHelper';
import BugsnagHelper from '../../helpers/bugsnagHelper';
import HttpError from '../../helpers/errorHandler';
import ProviderHelper from '../../helpers/providerHelper';

class CabsController {
  static async createCab(req, res) {
    try {
      const {
        body: {
          regNumber, capacity, model, providerId
        }
      } = req;
      const { _options: { isNewRecord }, dataValues } = await cabService.findOrCreateCab(
        regNumber, capacity, model, providerId
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

  /**
   * @param req
   * @param res
   * @returns {Promise<*>}
   */
  static async getAllCabs(req, res) {
    try {
      const { pageable, where } = ProviderHelper.getProviderDetailsFromReq(req.query);
      const payload = await cabService.getPaginatedItems(pageable, where);
      const message = getPaginationMessage(payload.pageMeta);

      return Response.sendResponse(res, 200, true, message, payload);
    } catch (error) {
      BugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async updateCabDetails(req, res) {
    const { params: { id }, body } = req;
    const { regNumber } = body;
    try {
      const findCab = await cabService.findByRegNumber(regNumber);
      if (findCab !== null && findCab.id !== parseInt(id, 10)) {
        return res.status(409).send({
          success: false, message: 'Cab with registration number already exists'
        });
      }
      const cab = await cabService.updateCab(id, body);
      if (cab.message) {
        return res.status(404).send({ success: false, message: cab.message });
      }
      res.status(200).send({
        success: true, message: 'Cab details updated successfully', data: cab
      });
    } catch (error) {
      BugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async deleteCab(req, res) {
    try {
      const { params: { id } } = req;
      const dbResponse = await cabService.deleteCab(id);
      if (dbResponse > 0) {
        const message = 'Cab successfully deleted';
        return Response.sendResponse(res, 200, true, message);
      }
      const doesNotExist = { message: 'Cab does not exist', statusCode: 404 };
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
