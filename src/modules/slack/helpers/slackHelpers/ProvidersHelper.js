import { providerService } from '../../../../services/ProviderService';
import UserService from '../../../../services/UserService';

export default class ProvidersHelper {
  static toProviderLabelPairValues(providers) {
    return providers.map((val) => {
      const { id, name, providerUserId } = val;
      const valueDetails = [id, name, providerUserId].toString();
      const data = {
        label: ProvidersHelper.generateProviderLabel(val),
        value: valueDetails
      };
      return data;
    });
  }

  static generateProviderLabel(provider) {
    const format = `${provider.name}`;
    return format;
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
