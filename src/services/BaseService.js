import ProviderHelper from '../helpers/providerHelper';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
/**
 * A class representing the base for all Services
 * This bootstrap commonly used methods across services
 *
 * @class BaseService
 */

export default class BaseService {
  /**
   * Creates an instance of BaseService.
   *
   * @param {object} model - The model to instantiate with the service
   * @memberof BaseService
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Fetch a specific data by a given id
   *
   * @param {number} id - The model's unique identifier (primary key)
   * @returns {object} The model instance
   * @memberof BaseService
   */
  async findById(id) {
    const result = await this.model.findByPk(id);
    return result;
  }

  /**
   * Fetch a specific data using the where clause
   *
   * @static
   * @param {object} attribute - A key value pair object containing the attribute(s)
   * @returns {object} The model instance
   * @memberof BaseService
   */
  async findOne(attribute) {
    const result = await this.model.findOne({ where: attribute });
    return result;
  }

  /**
   * Delete a specific resource
   *
   * @static
   * @param {object|number} resource - The specified resource object or unique identifier (id)
   * @returns {number} The number of affected rows
   * @memberof DriverService
   */
  async delete(resource) {
    const resourceId = (typeof resource === 'object') ? resource.id : resource;
    const result = await this.model.destroy({
      where: { id: resourceId }
    });
    return result;
  }

  /**
   * Gets items from the Db and paginates the data
   * @param Model; The model being queried
   * @param pageable: The page number
   * @param where: The conditions to be queried
   */
  async getPaginatedItems(pageable = ProviderHelper.defaultPageable, where = {}) {
    let items = [];
    const { page, size } = pageable;
    let filter;
    if (where && where.providerId) filter = { where: { providerId: where.providerId } };
    const paginatedDrivers = new SequelizePaginationHelper(this.model, filter, size);
    const { data, pageMeta } = await paginatedDrivers.getPageItems(page);
    const { totalPages } = pageMeta;
    if (page <= totalPages) { items = data.map(ProviderHelper.serializeDetails); }
    return { data: items, pageMeta };
  }
}
