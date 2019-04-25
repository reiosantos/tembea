import HomebaseService from '../../services/HomebaseService';
import HttpError from '../../helpers/errorHandler';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import CountryService from '../../services/CountryService';

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
}

export default HomebaseController;
