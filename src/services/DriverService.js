import { Op } from 'sequelize';
import BaseService from './BaseService';
import models from '../database/models';
import ProviderHelper from '../helpers/providerHelper';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';

const { Driver } = models;

/**
 * A class representing the Driver service
 *
 * @class DriverService
 * @extends {BaseService}
 */
class DriverService extends BaseService {
  constructor() {
    super(Driver);
  }

  /**
   *@description Adds a driver
   * @returns {  object }
   * @param driverObject
   */
  async createProviderDriver(driverObject) {
    try {
      const { driverNumber } = driverObject;
      const [driver] = await this.model.findOrCreate({
        where: { driverNumber: { [Op.like]: `${driverNumber}%` } },
        defaults: { ...driverObject }
      });
      return driver;
    } catch (e) {
      return e;
    }
  }

  /**
  * @description Returns a list of drivers from db
  * page and size variables can also be passed on the url
  * @param {{object}} where - Sequelize options.
  * @param {{ page:number, size:number }} pageable
  * @returns {object} An array of cabs
  * @example DriverService.getDrivers(
   *  { page:1, size:20 }
   * );
   */
  static async getDrivers(where = {}) {
    const filter = {
      where
    };
    const paginatedDrivers = new SequelizePaginationHelper(Driver, filter);
    const { data, pageMeta } = await paginatedDrivers.getPageItems();
    const drivers = data.map(ProviderHelper.serializeDetails);
    return { drivers, ...pageMeta };
  }

  /**
   * Get a specific driver by id
   *
   * @static
   * @param {number} id - The driver's unique identifier
   * @returns {object} The driver object
   * @memberof DriverService
   */
  async getDriverById(id) {
    const driver = await this.findById(id);
    return driver;
  }

  /**
   * Delete a specific driver information
   *
   * @static
   * @param {object|number} driverId - The specified driver object or unique identifier
   * @returns {object} An object containing the affected row
   * @memberof DriverService
   */
  async deleteDriver(driver) {
    const result = await this.delete(driver);
    return result;
  }
}

export const driverService = new DriverService();
export default DriverService;
