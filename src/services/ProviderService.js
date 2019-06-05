import { Op } from 'sequelize';
import models from '../database/models';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import ProviderHelper from '../helpers/providerHelper';
import ProviderValidator from '../middlewares/ProviderValidator';

const { Provider, User } = models;

class ProviderService {
  /**
   * @description Returns a list of providers from db
   * page and size variables can also be passed on the url
   * @param {{ page:number, size:number }} pageable
   * @param where {object}
   * @returns {object} An array of providers
   * @example ProviderService.getAllProvidersByPage(
   *  { page:1, size:20 }
   * );
   */
  static async getProviders(pageable = ProviderHelper.defaultPageable, where = {}) {
    let providers = [];
    const { page, size } = pageable;
    const include = [{
      model: User,
      as: 'user',
      attributes: ['name', 'phoneNo', 'email', 'slackId']
    }];
    const filter = {
      include,
      where
    };
    const paginatedCabs = new SequelizePaginationHelper(Provider, filter, size);
    const { data, pageMeta } = await paginatedCabs.getPageItems(page);
    const { totalPages } = pageMeta;
    if (page <= totalPages) {
      providers = data.map(ProviderHelper.serializeDetails);
    }
    return { providers, ...pageMeta };
  }

  /**
   * @description Update provider details
   * @returns {object} update provider details
   * @example ProviderService.updateProvider(
   *  {object},1);
   * @param updateObject
   * @param id
   */
  static async updateProvider(updateObject, id) {
    const data = await ProviderValidator.createUpdateBody(updateObject);
    if (data.message) return { message: data.message };
    const updatedProviderDetails = await Provider.update({ ...data },
      {
        returning: true,
        where: { id }
      });
    return updatedProviderDetails;
  }

  /**
   *@description Deletes provider details
   * @param id
   * @returns {Promise<*>}
   */

  static async deleteProvider(id) {
    const responseData = await Provider.destroy({
      where: { id }
    });
    return responseData;
  }

  /**
   *@description Adds a provider
   * @param name string
   * @param providerUserId number
   * @returns {object }
   */
  static async createProvider(name, providerUserId) {
    const [provider] = await Provider.findOrCreate({
      where: { name: { [Op.iLike]: `${name.trim()}%` } },
      defaults: {
        name: name.trim(),
        providerUserId,
      }
    });
    const { _options: { isNewRecord }, dataValues } = provider;
    return {
      provider: dataValues,
      isNewProvider: isNewRecord
    };
  }

  static async findProviderByPk(pk) {
    const provider = await Provider.findByPk(pk);
    return provider;
  }
}

export default ProviderService;
