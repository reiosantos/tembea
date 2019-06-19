import { Op } from 'sequelize';
import models from '../database/models';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import ProviderHelper from '../helpers/providerHelper';
import ProviderValidator from '../middlewares/ProviderValidator';
import BaseService from './BaseService';

const {
  Provider, User, Cab, Driver
} = models;

class ProviderService extends BaseService {
  constructor() {
    super(Provider);
  }

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

  /**
   * Find a specific provider by a given user id (owner)
   *
   * @param {number} providerUserId - The provider's owner id
   * @returns {object} The model instance
   * @memberof ProviderService
   */
  async findProviderByUserId(providerUserId) {
    const provider = await this.findOne({ providerUserId });
    return provider;
  }

  /**
   * Get a specific provider by id
   *
   * @static
   * @param {number} id - The provider's unique identifier
   * @returns {object} The provider object
   * @memberof ProviderService
   */
  async getProviderById(id) {
    const provider = await this.findById(id);
    return provider;
  }

  static async getViableProviders() {
    const providers = await Provider.findAll({
      include: [{
        model: Cab,
        as: 'vehicles'
      }, {
        model: Driver,
        as: 'drivers'
      }, {
        model: User,
        as: 'user',
        attributes: ['name', 'phoneNo', 'email', 'slackId']
      }],
    });
    return providers.filter(
      provider => provider.dataValues.vehicles.length > 0 && provider.dataValues.drivers.length > 0
    );
  }
}

export const providerService = new ProviderService();
export default ProviderService;
