import DriverService from '../DriverService';
import models from '../../database/models';
import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import ProviderHelper from '../../helpers/providerHelper';


jest.mock('../../helpers/sequelizePaginationHelper', () => jest.fn());
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
  describe('getProviders', () => {
    beforeEach(() => {
      SequelizePaginationHelper.mockClear();
      ProviderHelper.serializeDetails = jest.fn();
    });
    const listDrivers = {
      data: [
        {
          driverName: 'Muhwezi Deo2',
          driverPhoneNo: '070533111166',
          driverNumber: 'UB5422424344',
          providerId: 1
        },
        {
          driverName: 'Muhwezi Deo',
          driverPhoneNo: '070533111164',
          driverNumber: 'UB5422424345',
          providerId: 2
        }]
    };
    it('returns a list of drivers', async () => {
      const getPageItems = jest.fn()
        .mockResolvedValue(listDrivers);
      SequelizePaginationHelper.mockImplementation(() => ({
        getPageItems
      }));
      await DriverService.getDrivers({
        providerId: 1
      });
      expect(SequelizePaginationHelper).toHaveBeenCalled();
      expect(ProviderHelper.serializeDetails).toHaveBeenCalled();
    });
  });
});
