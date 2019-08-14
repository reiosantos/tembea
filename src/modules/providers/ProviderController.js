import { Op } from 'sequelize';
import ProviderService from '../../services/ProviderService';
import HttpError from '../../helpers/errorHandler';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import ProviderHelper from '../../helpers/providerHelper';
import ErrorTypeChecker from '../../helpers/ErrorTypeChecker';
import Response from '../../helpers/responseHelper';

class ProviderController {
  /**
   * @description Create a provider in the database
   * @param {object} req
   * @param {object} res
   * @returns {object} Http response object
   */
  static async addProvider(req, res) {
    const { locals: { providerData } } = res;
    const { headers: { homebaseid } } = req;
    try {
      const { provider, isNewProvider } = await ProviderService.createProvider(
        { ...providerData, homebaseid }
      );
      if (isNewProvider) {
        delete provider.deletedAt;
        return res.status(201)
          .json({
            success: true,
            message: 'Provider created successfully',
            provider
          });
      }
      return res.status(409).json({
        success: false,
        message: `The provider with name: '${provider.name}' already exists`
      });
    } catch (err) {
      bugsnagHelper.log(err);
      HttpError.sendErrorResponse(err, res);
    }
  }

  static async getAllProviders(req, res) {
    try {
      let { page, size, name } = req.query;
      const { headers: { homebaseid } } = req;
      page = page || 1;
      size = size || defaultSize;
      name = name && name.trim();
      const where = name ? {
        name: { [Op.iLike]: `%${name}%` }
      } : null;
      const pageable = { page, size };
      const providersData = await ProviderService.getProviders(pageable, where, homebaseid);
      const {
        totalPages, providers, pageNo, totalItems: totalResults, itemsPerPage: pageSize
      } = providersData;
      const message = `${pageNo} of ${totalPages} page(s).`;
      const pageData = ProviderHelper.paginateData(
        totalPages, page, totalResults, pageSize, providers, 'providers'
      );
      return Response.sendResponse(res, 200, true, message, pageData);
    } catch (error) {
      bugsnagHelper.log(error);
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
      bugsnagHelper.log(error);
      const { message, statusCode } = ErrorTypeChecker.checkSequelizeValidationError(error,
        `The name ${req.body.name} is already taken`);
      return Response.sendResponse(res, statusCode || 500,
        false, message || `Unable to update details ${error}`);
    }
  }
  /**
   * @description Deletes provider details
   * @returns {object} deletes provider details
   * @example ProviderService.deleteProvider(req,res);
   * @param req
   * @param res
   */

  static async deleteProvider(req, res) {
    let message;
    try {
      const { params: { id } } = req;
      const result = await ProviderService.deleteProvider(id);
      message = 'Provider does not exist';
      if (result > 0) {
        message = 'Provider deleted successfully';
        return Response.sendResponse(res, 200, true, message);
      }
      return Response.sendResponse(res, 404, false, message);
    } catch (error) {
      bugsnagHelper.log(error);
      const serverError = {
        message: 'Server Error. Could not complete the request',
        statusCode: 500
      };
      HttpError.sendErrorResponse(serverError, res);
    }
  }

  /**
   * @description method that gets all providers with vehicles and drivers
   * @param req
   * @param res
   */
  static async getViableProviders(req, res) {
    const { headers: { homebaseid } } = req;
    const providers = await ProviderService.getViableProviders(homebaseid);
    if (!providers[0]) return Response.sendResponse(res, 404, false, 'No viable provider exists');
    return Response.sendResponse(res, 200, true, 'List of viable providers', providers);
  }
}

export default ProviderController;
