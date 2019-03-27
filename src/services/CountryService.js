import { Op } from 'sequelize';
import request from 'request-promise-native';
import models from '../database/models';
import RemoveDataValues from '../helpers/removeDataValues';
import HttpError from '../helpers/errorHandler';

const { Country } = models;

class CountryService {
  /**
     * @description Creates a new country in the database if it does not exist
     * @param {string} name The country's name
     * @returns {object} The new country's data values
     */
  static async createCountry(name) {
    const [country] = await Country.findOrCreate({
      where: { name: { [Op.iLike]: `${name.trim()}%` } },
      defaults: { name },
    });
    const { _options: { isNewRecord } } = country;
    return {
      country: RemoveDataValues.removeDataValues(country),
      isNewCountry: isNewRecord
    };
  }

  /**
     * @description Finds a country by the country name
     * @param {string} name The country's name
     * @param {number} id The country's id
     * @returns {object} The new country's data values
     */
  static async findCountry(name, id = -1) {
    const country = Country.findOne({
      where: {
        [Op.or]: [
          { id },
          { name: { [Op.iLike]: `${name.trim()}` } }
        ]
      }
    });
    return RemoveDataValues.removeDataValues(country);
  }

  /**
     * @description Returns a list of countries
     * @param {number} size The number of countries you want to return
     * @param {number}  page The page number
     * @param {string} name The name of the country
     * @returns {object} A list of all countries in the database
     */

  static async getAllCountries(size, page, name) {
    const countries = Country.findAndCountAll({
      raw: true,
      limit: size,
      offset: (size * (page - 1)),
      order: [['id', 'ASC']],
      where: { name: { [Op.iLike]: `${name}%` } },
    });
    return RemoveDataValues.removeDataValues(countries);
  }

  /**
     * @description Finds a country by the id
     * @param {number} id the country's id in the database
     * @returns {object} The country's data
     */
  static async getCountryById(id) {
    const country = await Country.findOne({
      where: { id }
    });
    return country;
  }

  /**
     * @description Updates a country's name by id
     * @param {number} id the country's id in the database
     * @param {object} name the country's name
     * @returns {object} The updated country's data
     */
  static async updateCountryName(id, name) {
    const country = await CountryService.getCountryById(id);
    if (name) {
      await country.update({ name });
    }
    return RemoveDataValues.removeDataValues(country);
  }


  /**
     * @description deletes a country's name by id or name
     * @param {number} id the country's id in the database
     * @param {object} name the country's name
     * @returns {object} The updated country's data
     */
  static async deleteCountryByNameOrId(id = -1, name = '') {
    const country = await Country.findOne({
      where: {
        [Op.or]: [
          { id },
          { name: { [Op.iLike]: `${name}%` } }
        ]
      }
    });
    HttpError.throwErrorIfNull(country, `Country named '${name}' was not found`, 404);
    country.status = 'Inactive';
    await country.save();
    return true;
  }

  /**
   * @description deletes a country's name by id or name
   * @param {string} name the country's name
   * @param {string} status the country's status
   * @returns {object} The country's data
   */
  static async findDeletedCountry(name = '', status = 'Inactive') {
    const country = await Country.scope('all').findOne({
      where: {
        [Op.and]: [
          { status },
          { name: name.trim() }
        ]
      }
    });
    return country;
  }

  /**
   * @description finds if a  country is listed globally
   * @param {string} name the country's name
   * @returns {any} The country's data or an error object
   */
  static async findIfCountryIsListedGlobally(name) {
    const uri = `https://restcountries.eu/rest/v2/name/${name}`;
    try {
      const countryData = await request.get(uri);
      return countryData;
    } catch (error) {
      return error;
    }
  }
}
export default CountryService;
