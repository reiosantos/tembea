import HttpError from '../../helpers/errorHandler';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import CountryService from '../../services/CountryService';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';

class CountryController {
  /**
     * @description Get the country's name from the database
     * @param {object} req
     * @param {object} res
     * @returns {object} Http response object
     */

  static async addCountry(req, res) {
    const { body: { name } } = req;
    try {
      const { country, isNewCountry } = await CountryService.createCountry(name);
      if (isNewCountry) {
        return res.status(201).json({
          success: true,
          message: 'Country created successfully',
          country
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Country Already Exists',
      });
    } catch (err) {
      bugsnagHelper.log(err);
      HttpError.sendErrorResponse(err, res);
    }
  }

  /**
   * @description Updates a country's name
   * @param {object} req
   * @param {object} res
   * @returns {object} Http response object
   */
  static async updateCountry(req, res) {
    const { name, newName } = req.body;
    try {
      let country = await CountryService.findCountry(name);
      if (country) {
        const countryId = country.id;
        country = await CountryService.updateCountryName(countryId, newName);
        return res.status(200)
          .json({
            success: true,
            message: 'Country updated successfully',
            country
          });
      }
    } catch (err) {
      bugsnagHelper.log(err);
      HttpError.sendErrorResponse(err, res);
    }
  }

  /**
   * @description Deletes a country
   * @param {object} req
   * @param {object} res
   * @returns {object} Http response object
   */
  static async deleteCountry(req, res) {
    try {
      const { body: { id, name } } = req;
      const success = await CountryService.deleteCountryByNameOrId(id, name);
      if (success) {
        return res.status(200).json({
          success,
          message: 'The country has been deleted'
        });
      }
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description Gets all countries in the database
   * @param {object} req
   * @param {object} res
   * @returns {object} Http response object
   */
  static async getAllCountries(req, res) {
    try {
      const page = req.query.page || 1;
      const size = req.query.size || defaultSize;
      const name = req.query.name || '';
      const countries = await CountryService.getAllCountries(size, page, name);
      const { count, rows } = countries;
      if (rows <= 0) {
        throw new HttpError('There are no countries on this page.', 404);
      }
      const totalPages = Math.ceil(count / size);
      return res.status(200).json({
        success: true,
        message: `${page} of ${totalPages} page(s).`,
        pageMeta: {
          totalPages,
          totalResults: count,
          page,
          size
        },
        countries: rows,
      });
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default CountryController;
