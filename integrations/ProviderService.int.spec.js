import ProviderService from '../src/services/ProviderService';
import models from '../src/database/models';

describe('create Provider', () => {
  afterAll(() => {
    models.sequelize.close();
  });
  it('should create a provider', async () => {
    const testProvider = {
      name: 'MyCabs',
      id: 1
    };
    const { name, id } = testProvider;
    const result = await ProviderService.createProvider(name, id);
    const { provider } = result;
    expect(provider.providerUserId).toEqual(1);
    expect(provider.deletedAt).toEqual(null);
    expect(provider.name).toEqual('MyCabs');
  });
});
