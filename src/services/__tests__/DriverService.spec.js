import DriverService from '../DriverService';
import models from '../../database/models';

const {
  Driver, sequelize
} = models;

describe('Driver Service', () => {
  let testDriver;
  beforeAll(async () => {
    testDriver = Driver.create({
      driverName: 'Muhwezi Deo2',
      driverPhoneNo: '0700000011',
      driverNumber: 'UB54224249',
      providerId: 1
    });
  });
  afterAll(async () => {
    await testDriver.destroy({ force: true });
    sequelize.close();
  });
  it('should create driver successfully', async () => {
    const driver = await DriverService.createProviderDriver({
      driverName: 'Muhwezi Deo2',
      driverPhoneNo: '070533111166',
      driverNumber: 'UB5422424344',
      providerId: 1
    });
    expect(driver).toBeDefined();
    expect(driver.driverName).toEqual('Muhwezi Deo2');
    await driver.destroy({ force: true });
  });
  it('should return not create driver if driverNumber exists', async (done) => {
    const driver = await DriverService.createProviderDriver({
      driverName: 'Muhwezi Deo2',
      driverPhoneNo: '0700000011',
      driverNumber: 'UB54224249',
      providerId: 1
    });
    const { _options: { isNewRecord } } = driver;
    expect(isNewRecord).toBeFalsy();
    done();
  });
  it('Should get all drivers belonging to a provider', async () => {
    const drivers = await DriverService.getProviderDrivers(1);
    expect(drivers).toBeDefined();
    expect(drivers[0].driverName).toEqual('James Savali');
  });
});
