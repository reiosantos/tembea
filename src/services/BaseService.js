/**
 * A class representing the base for all Services
 * This bootstrap commonly used methods accross services
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
   * @static
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
    const result = await this.model.findOne({ where: { attribute } });
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
}
