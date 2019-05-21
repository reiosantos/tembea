import { Op } from 'sequelize';
import models from '../database/models';
import cache from '../cache';
import RemoveDataValues from '../helpers/removeDataValues';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import ProviderHelper from '../helpers/providerHelper';


const { Cab } = models;
const getCabKey = pk => `CabDetail_${pk}`;

export default class CabService {
  static async findOrCreate(regNumber) {
    const [cabDetails] = await Cab.findOrCreate({
      where: { regNumber: { [Op.iLike]: `${regNumber}%` } },
      defaults: { regNumber }
    });
    return cabDetails;
  }

  static async findOrCreateCab(driverName, driverPhoneNo, regNumber, capacity, model, location) {
    const [cab] = await Cab.findOrCreate({
      where: {
        [Op.or]: [{ driverPhoneNo }, { regNumber }]
      },
      defaults: {
        driverName,
        driverPhoneNo,
        regNumber,
        capacity,
        model,
        location
      }
    });
    return cab;
  }

  static async findByRegNumber(regNumber) {
    const cabDetails = await Cab.findOne({ where: { regNumber } });
    return cabDetails;
  }

  static async getById(pk) {
    const cachedTrip = await cache.fetch(getCabKey(pk));
    if (cachedTrip) {
      return cachedTrip;
    }
    try {
      const cab = await Cab.findByPk(pk);
      const data = RemoveDataValues.removeDataValues(cab.dataValues);
      await cache.saveObject(getCabKey(pk), data);
      return data;
    } catch (error) {
      throw new Error('Could not return the requested cab');
    }
  }

  /**
   * @description Returns a list of cabs from db
   * page and size variables can also be passed on the url
   * @param {{object}} where - Sequelize options.
   * @param {{ page:number, size:number }} pageable
   * @returns {object} An array of cabs
   * @example CabService.getAllCabsByPage(
   *  { page:1, size:20 }
   * );
   */
  static async getCabs(pageable = ProviderHelper.defaultPageable, where = {}) {
    let cabs = [];
    const { page, size } = pageable;
    let filter;
    if (where && where.providerId) filter = { where: { providerId: where.providerId } };
    const paginatedCabs = new SequelizePaginationHelper(Cab, filter, size);
    const { data, pageMeta } = await paginatedCabs.getPageItems(page);
    const { totalPages } = pageMeta;
    if (page <= totalPages) { cabs = data.map(ProviderHelper.serializeDetails); }
    return { cabs, ...pageMeta };
  }

  static async updateCab(cabId, cabUpdateObject) {
    try {
      const cabDetails = await Cab.update({ ...cabUpdateObject },
        {
          returning: true,
          where: { id: cabId }
        });

      if (cabDetails[1].length === 0) return { message: 'Update Failed. Cab does not exist' };

      return RemoveDataValues.removeDataValues(cabDetails[1][0]);
    } catch (error) {
      throw new Error('Could not update cab details');
    }
  }

  static async deleteCab(cabId) {
    const responseData = await Cab.destroy({
      where: { id: cabId }
    });
    return responseData;
  }
}
