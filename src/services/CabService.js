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
}
