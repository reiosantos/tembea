import { Op } from 'sequelize';
import models from '../database/models';
import RemoveDataValues from '../helpers/removeDataValues';

const { Homebase } = models;

class HomebaseService {
  static async createHomebase(homebaseName, countryId) {
    const [homebase] = await Homebase.findOrCreate({
      where: { name: { [Op.iLike]: `${homebaseName.trim()}%` } },
      defaults: {
        name: homebaseName.trim(),
        countryId,
      }
    });
    const { _options: { isNewRecord } } = homebase;
    return {
      homebase: RemoveDataValues.removeDataValues(homebase),
      isNewHomebase: isNewRecord
    };
  }
}

export default HomebaseService;
