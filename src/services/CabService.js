import { Op } from 'sequelize';
import models from '../database/models';
import cache from '../cache';
import RemoveDataValues from '../helpers/removeDataValues';

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
}
