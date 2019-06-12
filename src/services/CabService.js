import { Op } from 'sequelize';
import models from '../database/models';
import cache from '../cache';
import RemoveDataValues from '../helpers/removeDataValues';
import ProviderHelper from '../helpers/providerHelper';
import BaseService from './BaseService';


const { Cab } = models;
const getCabKey = pk => `CabDetail_${pk}`;

class CabService extends BaseService {
  constructor() {
    super(Cab);
  }

  async findOrCreate(regNumber) {
    const [cabDetails] = await this.model.findOrCreate({
      where: { regNumber: { [Op.iLike]: `${regNumber}%` } },
      defaults: { regNumber }
    });
    return cabDetails;
  }

  async findOrCreateCab(regNumber, capacity, model, providerId) {
    const payload = {
      where: { regNumber },
      defaults: {
        regNumber, capacity, model, providerId
      }
    };
    const [cab] = await this.model.findOrCreate(payload);
    return cab;
  }

  async findByRegNumber(regNumber) {
    const cabDetails = await this.model.findOne({
      where: { regNumber },
      paranoid: false,
    });
    return cabDetails;
  }

  async getById(pk) {
    const cachedTrip = await cache.fetch(getCabKey(pk));
    if (cachedTrip) {
      return cachedTrip;
    }
    try {
      const cab = await this.model.findByPk(pk);
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
   * @example CabService.getAllCabsByPage(
   *  { page:1, size:20 }
   * );
   */
  async getCabs(pageable = ProviderHelper.defaultPageable, where = {}) {
    return this.getPaginatedItems(pageable, where);
  }

  async updateCab(cabId, cabUpdateObject) {
    try {
      const cabDetails = await this.model.update({ ...cabUpdateObject },
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

  async deleteCab(cabId) {
    const responseData = await this.model.destroy({
      where: { id: cabId }
    });
    return responseData;
  }
}

export const cabService = new CabService();
export default CabService;
