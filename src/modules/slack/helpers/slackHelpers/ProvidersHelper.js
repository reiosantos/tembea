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
}
