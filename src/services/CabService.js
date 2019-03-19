import { Op } from 'sequelize';
import models from '../database/models';
import cache from '../cache';
import RemoveDataValues from '../helpers/removeDataValues';
import { MAX_INT as all } from '../helpers/constants';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';

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
      throw new Error('Could not return the requested trip');
    }
  }

  static get defaultPageable() {
    return {
      page: 1,
      size: all
    };
  }

  /* eslint no-unused-vars: ["error", { "ignoreRestSiblings": true }] */
  static serializeCab(cabDetails) {
    let cabInfo = {};
    if (cabDetails) {
      const {
        id, createdAt, updatedAt, ...details
      } = cabDetails;
      cabInfo = details;
    }
    return cabInfo;
  }

  /**
   * @description Returns a list of cabs from db
   * page and size variables can also be passed on the url
   * @param {{ page:number, size:number }} pageable
   * @returns {object} An array of cabs
   * @example CabService.getAllCabsByPage(
   *  { page:1, size:20 }
   * );
   */
  static async getCabs(pageable = CabService.defaultPageable) {
    const { page, size } = pageable;
    const paginatedCabs = new SequelizePaginationHelper(Cab, null, size);
    const { data, pageMeta } = await paginatedCabs.getPageItems(page);
    const cabs = data.map(CabService.serializeCab);
    return { cabs, ...pageMeta };
  }
}
