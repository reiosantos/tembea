import { Op } from 'sequelize';
import models from '../database/models';
import ProviderHelper from '../helpers/providerHelper';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';

const { Driver } = models;

class DriverService {
  /**
   *@description Adds a driver
   * @returns {  object }
   * @param driverObject
   */
  static async createProviderDriver(driverObject) {
    try {
      const { driverNumber } = driverObject;
      const [driver] = await Driver.findOrCreate({
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
}
export default DriverService;
