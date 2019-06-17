import faker from 'faker';
import { driverService } from '../src/services/DriverService';
import models from '../src/database/models';
import {
  createUser,
  createProvider,
  createDriver,
} from './support/helpers';

let mockUser;
let mockProvider;
let mockDriver;

beforeAll(async () => {
  mockUser = await createUser({
    name: faker.name.findName(),
    slackId: faker.random.word().toUpperCase(),
    phoneNo: faker.phone.phoneNumber('080########'),
    email: faker.internet.email(),
  });
  mockProvider = await createProvider({
    name: faker.random.word(),
    providerUserId: mockUser.id
  });
  mockDriver = await createDriver({
    driverName: faker.name.findName(),
    driverPhoneNo: faker.phone.phoneNumber('080########'),
    driverNumber: faker.random.number(),
    providerId: mockProvider.id,
    email: faker.internet.email(),
  });
});

afterAll(async () => {
  models.sequelize.close();
});

describe('DriverService > getDriverById', () => {
  it('should fetch a specific driver by given id', async () => {
    const { id, driverName, email } = mockDriver;
    const result = await driverService.getDriverById(id);
    expect(result.id).toBe(id);
    expect(result.driverName).toBe(driverName);
    expect(result.email).toBe(email);
    expect(result.deletedAt).toBeNull();
  });
});
describe('DriverService > deleteDriver', () => {
  it('should delete a specific driver', async () => {
    const result = await driverService.deleteDriver(mockDriver);
    expect(result).toBeTruthy();
  });
});
