import database from '../database';
import HttpError from '../helpers/errorHandler';
import bugsnagHelper from '../helpers/bugsnagHelper';

const { models: { Location } } = database;

class LocationService {
  /**
   * @description Get location by longitude and latitude from the database
   * @param {number} longitude The longitude of the location on the db
   * @param {number} latitude The latitude of the location on the db
   * @param {boolean} raiseError
   * @param {boolean} includeAddress
   * @return {Promise<object>} location model
   */
  static async findLocation(longitude, latitude, raiseError = false, includeAddress = false) {
    try {
      let include;
      if (includeAddress) {
        include = ['address'];
      }
      const location = await Location.findOne({
        where: {
          longitude,
          latitude
        },
        include
      });

      if (raiseError) {
        HttpError.throwErrorIfNull(location, 'Location not found');
      }

      return location;
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.throwErrorIfNull(null, 'Could not find location record', 500);
    }
  }

  /**
   * @description creates a new location on the database if it does not exist
   * @param  {number} longitude The longitude of the location on the db
   * @param  {number} latitude The latitude of the location on the db
   * @returns {object} The new location datavalues
   */
  static async createLocation(longitude, latitude) {
    try {
      const [newlocation] = await Location.findOrCreate({
        where: { longitude, latitude },
        defaults: { longitude, latitude },
      });
      return newlocation.dataValues;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}

export default LocationService;
