import ProviderService from '../../services/ProviderService';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';
import BugsnagHelper from '../../helpers/bugsnagHelper';
import HttpError from '../../helpers/errorHandler';
import ProviderHelper from '../../helpers/providerHelper';


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
}

export default ProvidersController;
