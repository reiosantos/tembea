import faker from 'faker';
import ProviderService, { providerService } from '../src/services/ProviderService';
import models from '../src/database/models';
import { createUser, createProvider } from './support/helpers';


let mockUser;
let mockProvider;
let homebase;

beforeAll(async () => {
  const { id } = await models.Country.create({
    name: faker.name.findName(),
  });
  homebase = await models.Homebase.create({
    country: faker.name.findName(),
    countryId: id
  });
  const userData = {
    name: faker.name.findName(),
    slackId: faker.random.word().toUpperCase(),
    phoneNo: faker.phone.phoneNumber('080########'),
    email: faker.internet.email(),
    homebaseId: homebase.id
  };
  mockUser = await createUser(userData);
  mockProvider = await createProvider({
    name: faker.random.word(),
    providerUserId: mockUser.id,
    homebaseId: homebase.id
  });
});

afterAll(async () => {
  await models.sequelize.close();
});

describe('create Provider', () => {
  it('should create a provider', async () => {
    const testProvider = {
      name: faker.random.word(),
      providerUserId: mockUser.id,
      isDirectMessage: true,
      homebaseId: homebase.id
    };
    const result = await ProviderService.createProvider(testProvider);
    const { provider } = result;
    expect(provider.providerUserId).toEqual(mockUser.id);
    expect(provider.deletedAt).toEqual(null);
    expect(provider.name).toEqual(testProvider.name);
  });
});

describe('ProviderService.getProviderById', () => {
  it('should fetch a specific provider by id', async () => {
    const { id, name } = mockProvider;
    const result = await providerService.getProviderById(id);
    expect(result.id).toBe(id);
    expect(result.name).toBe(name);
  });
});
