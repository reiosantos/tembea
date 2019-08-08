import { providerService } from '../../../../services/ProviderService';
import UserService from '../../../../services/UserService';

export default class ProvidersHelper {
  static toProviderLabelPairValues(providers) {
    return providers.map(val => ({
      label: `${val.name}`,
      value: val.id
    }));
  }

  /**
   * @method getProviderUserDetails
   * @param {number} providerId
   * @returns {object} Returns provider user-specific details
   * @description This helper method is needed for notification purposes.
   */
  static async getProviderUserDetails(providerId) {
    const { providerUserId, name: providerName } = await providerService.getProviderById(providerId);
    const {
      slackId: providerUserSlackId
    } = await UserService.getUserById(providerUserId);
    return { providerUserSlackId, providerName };
  }
}
