import CountryService from '../services/CountryService';

class CountryHelper {
  /**
   * @description This middleware checks if a country name is valid
   * @param  {string} countryName The name of the country
   * @param  {number} id The id of the country
   * @return {any} A boolean value or null
   */
  static async checkIfCountryExists(countryName = '', id = -1) {
    const country = await CountryService.findCountry(countryName, id);
    if (country == null) {
      return null;
    }
    return country;
  }

  /**
   * @description This middleware checks if a country name is valid
   * @param  {string} countryName The name of the country
   * @param  {number} id The id of the country
   * @return {any} A boolean value or null
   */
  static async checkIfCountryExistsById(countryId) {
    const country = await CountryService.getCountryById(countryId);
    if (country == null) {
      return null;
    }
    return country;
  }

  /**
   * @description This middleware checks if a country name is valid
   * @param  {string} str a string
   * @return {boolean} A boolean value
   */
  static validateString(str) {
    const strRegex = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
    return strRegex.test(str);
  }

  /**
   * @description This middleware checks if a country name is valid
   * @param  {string} countryName The name of the country
   * @return {object} country
   */
  static async validateIfCountryIsDeleted(countryName) {
    const country = await CountryService.findDeletedCountry(countryName);
    return country;
  }

  /**
   * @description This middleware checks if a country exists in the world map
   * @param  {string} countryName The name of the country
   * @return {boolean} whether the country exists or not
   */
  static async checkCountry(countryName) {
    const result = await CountryService.findIfCountryIsListedGlobally(countryName);
    const { error, name } = result;
    if (name === 'RequestError') {
      return true;
    }
    return !error;
  }
}

export default CountryHelper;
