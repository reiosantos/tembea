import { driverService } from '../DriverService';
import models from '../../database/models';
import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import ProviderHelper from '../../helpers/providerHelper';
import RemoveDataValues from '../../helpers/removeDataValues';


jest.mock('../../helpers/sequelizePaginationHelper', () => jest.fn());
const {
  Driver, sequelize
} = models;

describe('Driver Service', () => {
  let testDriver;
  beforeAll(async () => {
    SequelizePaginationHelper.mockClear();
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
    const driver = await driverService.create({
      driverName: 'Muhwezi Deo2',
      driverPhoneNo: '070533111166',
      driverNumber: 'UB5422424344',
      providerId: 1
    });
    expect(driver).toBeDefined();
    expect(driver.driverName).toEqual('Muhwezi Deo2');
    await driver.destroy({ force: true });
  });
  it('should return not create driver if driverNumber exists', async () => {
    const driver = await driverService.create({
      driverName: 'Muhwezi Deo2',
      driverPhoneNo: '0700000011',
      driverNumber: 'UB54224249',
      providerId: 1
    });
    const { _options: { isNewRecord } } = driver;
    expect(isNewRecord).toBeFalsy();
  });
  describe('getProviders', () => {
    beforeEach(() => {
      SequelizePaginationHelper.mockClear();
      ProviderHelper.serializeDetails = jest.fn();
    });

    it('returns a list of drivers', async () => {
      const getPageItems = jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            driverName: 'James Savali',
            driverPhoneNo: '708989098',
            driverNumber: '254234',
            providerId: 1,
            email: 'savali@gmail.com'
          },
          {
            id: 2,
            driverName: 'Muhwezi Deo',
            driverPhoneNo: '908989098',
            driverNumber: '254235',
            providerId: 2,
            email: 'deo@gmail.com'
          },
        ],
        pageMeta: {
          totalPages: 1,
          page: 1,
          totalResults: 4,
          pageSize: 100
        }
      });
      SequelizePaginationHelper.mockImplementation(() => ({
        getPageItems
      }));
      await driverService.getPaginatedItems(undefined, {
        providerId: 1
      });
      expect(SequelizePaginationHelper).toHaveBeenCalled();
      expect(getPageItems).toHaveBeenCalled();
      expect(ProviderHelper.serializeDetails).toHaveBeenCalled();
    });
  });
  describe('Update Driver', () => {
    let driverDetails;
    beforeEach(() => {
      driverDetails = {
        driverName: 'Muhwezi De',
        driverPhoneNo: '070533111',
        driverNumber: 'UB5422424',
        email: 'james@andela.com'
      };
      jest.spyOn(RemoveDataValues, 'removeDataValues');
    });
    it('Should return an error if driver does not exist', async () => {
      jest.spyOn(Driver, 'update').mockResolvedValue([{}, []]);
      const result = await driverService.update(1, driverDetails);
      expect(Driver.update).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Update Failed. Driver does not exist' });
    });
    it('should update a driver', async () => {
      jest.spyOn(Driver, 'update')
        .mockResolvedValue([{}, [[{ dataValues: driverDetails }]]]);
      const result = await driverService.update(1, driverDetails);
      expect(Driver.update).toHaveBeenCalled();
      expect(RemoveDataValues.removeDataValues).toHaveBeenCalled();
      expect(result).toEqual([driverDetails]);
    });
    it('should get driver by id', async () => {
      driverDetails.id = 1;
      jest.spyOn(Driver, 'findByPk').mockResolvedValue(driverDetails);
      const driver = await driverService.getDriverById(1);
      expect(driver).toEqual(driverDetails);
    });
    it('should check if a driver already exists when updating', async () => {
      jest.spyOn(Driver, 'count').mockResolvedValue(1);
      const driverCount = await driverService.exists('deo@andela.com', '891293', '123123', 1);
      expect(driverCount).toEqual(1);
      expect(Driver.count).toHaveBeenCalled();
    });
    it('should check if a driver already exists when adding a driver', async () => {
      jest.spyOn(Driver, 'count').mockResolvedValue(1);
      const driverCount = await driverService.exists('deo@andela.com', '891293', '123123');
      expect(driverCount).toEqual(1);
      expect(Driver.count).toHaveBeenCalled();
    });
  });
});
