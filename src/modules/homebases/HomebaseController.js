import HomebaseService from '../../services/HomebaseService';
import HttpError from '../../helpers/errorHandler';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import CountryService from '../../services/CountryService';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';

class HomebaseController {
  /**
     * @description Create a homebase in the database
     * @param {object} req
     * @param {object} res
     * @returns {object} Http response object
     */

  static async addHomeBase(req, res) {
    const {
      countryName, homebaseName
    } = req.body;
    try {
      const country = await CountryService.findCountry(countryName);
      const { homebase, isNewHomebase } = await HomebaseService.createHomebase(
        homebaseName, country.id
      );
      if (isNewHomebase) {
        delete homebase.deletedAt;
        return res.status(201)
          .json({
            success: true,
            message: 'Homebase created successfully',
            homeBase: homebase
          });
      }
      return res.status(409).json({
        success: false,
        message: `The homebase with name: '${homebaseName.trim()}' already exists`
      });
    } catch (err) {
      bugsnagHelper.log(err);
      HttpError.sendErrorResponse(err, res);
    }
  }

  /**
   * @description get a homebase in the database
   * @param {object} req
   * @param {object} res
   * @returns {object} list of homebases
   */
  static async getHomebases(req, res) {
    try {
      let { page, size } = req.query;
      page = page || 1;
      size = size || defaultSize;
      const where = HomebaseService.getWhereClause(req.query);
      const pageable = { page, size };
      const result = await HomebaseService.getHomebases(pageable, where);
      const message = `${result.pageNo} of ${result.totalPages} page(s).`;
      const pageMeta = {
        totalPages: result.totalPages,
        page: result.pageNo,
        totalResults: result.totalItems,
        pageSize: result.itemsPerPage
      };
      return (result.homebases.length === 1 ? res.status(200).json({
        success: true, message, homebase: result.homebases
      }) : res.status(200).json({
        success: true, message, pageMeta, homebases: result.homebases
      }));
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
      bugsnagHelper.log(error);
    }
  }
}

export default HomebaseController;
