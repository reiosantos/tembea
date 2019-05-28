import { Op } from 'sequelize';
import models from '../database/models';

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
}
export default DriverService;
