import { Op } from 'sequelize';
import models from '../database/models';

const { Cab } = models;

export default class CabService {
  static async findOrCreate(regNumber) {
    const [cabDetails] = await Cab.findOrCreate({
      where: { regNumber: { [Op.iLike]: `${regNumber}%` } },
      defaults: { regNumber }
    });
    return cabDetails;
  }

  static async findOrCreateCab(driverName, driverPhoneNo, regNumber) {
    const [cab] = await Cab.findOrCreate({
      where: {
        [Op.or]: [{ driverPhoneNo }, { regNumber }]
      },
      defaults: {
        driverName,
        driverPhoneNo,
        regNumber,
      }
    });
    return cab.dataValues;
  }
}
