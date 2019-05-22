import models from '../database/models';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import ProviderHelper from '../helpers/providerHelper';
import ProviderValidator from '../middlewares/ProviderValidator';


const { Provider, User } = models;

export default class ProviderService {
  /**
   * @description Returns a list of providers from db
   * page and size variables can also be passed on the url
   * @param {{ page:number, size:number }} pageable
   * @param where
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
      attributes: ['name', 'phoneNo', 'email']
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
   * @export ProviderService,deleteProvide(1)
   * @param id
   * @returns {Promise<*>}
   */

  static async deleteProvider(id) {
    const responseData = await Provider.destroy({
      where: { id }
    });
    return responseData;
  }
}
