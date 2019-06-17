import UserService from '../../../../services/UserService';
import { providerService } from '../../../../services/ProviderService';

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

  static async selectCabDialogHelper(callback, payload, userId) {
    let callbackId = 'providers_approval';
    let where;
    if (callback === 'providers_route_approval') {
      const { value } = payload.actions[0];
      const routeDetails = JSON.parse(value.split('_')[3]);
      const providerId = routeDetails.Provider.split(',')[0];
      where = { providerId };
      callbackId = `${callbackId}_route`;
    } else {
      const { id } = await UserService.getUserBySlackId(userId);
      const provider = await providerService.findProviderByUserId(id);
      where = { providerId: provider.id };
      callbackId = `${callbackId}_trip`;
    }
    return { where, callbackId };
  }
}
