import ProviderService from '../../services/ProviderService';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import BugsnagHelper from '../../helpers/bugsnagHelper';
import HttpError from '../../helpers/errorHandler';
import ProviderHelper from '../../helpers/providerHelper';
import ErrorTypeChecker from '../../helpers/ErrorTypeChecker';

class ProvidersController {
  static async getAllProviders(req, res) {
    try {
      let { page, size, name } = req.query;
      page = page || 1;
      size = size || defaultSize;
      name = name && name.trim();
      const where = name ? {
        name: { $iLike: `%${name}%` }
      } : null;
      const pageable = { page, size };
      const {
        totalPages,
        providers,
        pageNo,
        totalItems: totalResults,
        itemsPerPage: pageSize
      } = await ProviderService.getProviders(pageable, where);
      const message = `${pageNo} of ${totalPages} page(s).`;
      const pageData = ProviderHelper.paginateData(totalPages, page, totalResults, pageSize, providers, 'providers');
      return Response.sendResponse(res, 200, true, message, pageData);
    } catch (error) {
      BugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description Updates provider details
   * @returns {object} with updated provider details
   * @example ProvidersController.updateProvider(req,res);
   * @param req
   * @param res
   */
  static async updateProvider(req, res) {
    try {
      const { body, params: { id } } = req;
      const data = await ProviderService.updateProvider(body, id);
      if (data.message || data[1].length === 0) {
        return Response.sendResponse(res, 404, false, data.message || 'Provider doesnt exist');
      }
      return Response.sendResponse(res, 200, true,
        'Provider Details updated Successfully', data[1][0]);
    } catch (error) {
      BugsnagHelper.log(error);
      const { message, statusCode } = ErrorTypeChecker.checkSequelizeValidationError(error,
        `The name ${req.body.name} is already taken`);
      return Response.sendResponse(res, statusCode || 500,
        false, message || `Unable to update details ${error}`);
    }
  }
}

export default ProvidersController;
