import { Op } from 'sequelize';
import database from '../database';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import ProviderHelper from '../helpers/providerHelper';
import ProviderValidator from '../middlewares/ProviderValidator';
import BaseService from './BaseService';
import RemoveDataValues from '../helpers/removeDataValues';
import { homebaseInfo } from './RouteService';

const {
  models: {
    Provider, User, Cab, Driver
  }
} = database;

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
  static async getProviders(pageable = ProviderHelper.defaultPageable, where = {}, homebaseId) {
    let providers = [];
    const { page, size } = pageable;
    const include = [{
      model: User,
      as: 'user',
      attributes: ['name', 'phoneNo', 'email', 'slackId']
    },
    { ...homebaseInfo }
    ];
    const filter = {
      include,
      where: { ...where, homebaseId }
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
  static async updateProvider(updateObject, id, teamurl) {
    const data = await ProviderValidator.createUpdateBody(updateObject, teamurl);
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
   * @param {object} providerData - The Provider data
   * @returns {object }
   */
  static async createProvider(providerData) {
    const { name } = providerData;
    const [record, isNewProvider] = await Provider.findOrCreate({
      where: { name: { [Op.iLike]: `${name}%` } },
      defaults: providerData
    });
    const provider = record.get();
    return {
      provider,
      isNewProvider
    };
  }

  static async findByPk(pk, withFks = false) {
    const provider = await Provider.findByPk(pk, { include: withFks ? ['user'] : null });
    return RemoveDataValues.removeDataValues(provider);
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

  static async getViableProviders(homebaseId) {
    const providers = await Provider.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
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
      where: {
        homebaseId
      }
    });
    return providers.filter(
      (provider) => provider.dataValues.vehicles.length > 0 && provider.dataValues.drivers.length > 0
    );
  }

  /**
   * @description Returns a user and its provider detail of the specified slackId
   * @param slackId {string}
   * @returns {object} the user details
   */
  static async getProviderBySlackId(slackId) {
    const user = await Provider.findOne({
      include: [{
        model: User,
        where: { slackId },
        as: 'user',
        attributes: ['slackId', 'id']
      }]
    });
    return RemoveDataValues.removeDataValues(user);
  }

  /**
   * @description Returns a user and its provider detail of the specified userId
   * @param id {number} the user id
   * @returns {object} the user details
   */
  static async getProviderByUserId(id) {
    const user = await Provider.findOne({
      include: [{
        model: User,
        where: { id },
        as: 'user',
        attributes: ['slackId']
      }]
    });
    return RemoveDataValues.removeDataValues(user);
  }
}

export const providerService = new ProviderService();
export default ProviderService;
