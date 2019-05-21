import CabService from '../CabService';
import models from '../../database/models';
import cache from '../../cache';
import RemoveDataValues from '../../helpers/removeDataValues';
import { mockCabsData } from '../__mocks__';


jest.mock('../../cache');

const { Cab } = models;

describe('CabService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('findOrCreate', () => {
    it('return newly created cab if it does not exist', async (done) => {
      jest.spyOn(Cab, 'findOrCreate').mockImplementation(obj => Promise.resolve([obj.defaults]));
      const testRegNo = 'ABJ-151-737';
      const cab = await CabService.findOrCreate(testRegNo);
      expect(cab.regNumber).toEqual(testRegNo);
      done();
    });
  });

  describe('findOrCreateCab', () => {
    it("return newly created cab if it doesn't exist", async (done) => {
      jest.spyOn(Cab, 'findOrCreate').mockImplementation(obj => Promise.resolve([{
        dataValues: obj.defaults
      }]));
      const cab = await CabService.findOrCreateCab('Hello', 'World', 'Test');
      expect(cab.dataValues.driverName).toEqual('Hello');
      done();
    });
  });

  describe('findByRegNumber', () => {
    it('should return cab details from the db', async () => {
      const mockCabDetails = { driverName: 'Omari', regNumber: 'AR R3G NMB' };
      jest.spyOn(Cab, 'findOne').mockResolvedValue(mockCabDetails);
      const cabDetails = await CabService.findByRegNumber('AR R3G NMB');
      expect(cabDetails).toEqual(mockCabDetails);
    });
  });

  describe('getById', () => {
    const strippedData = { driverName: 'Omari', regNumber: 'AR R3G NMB' };
    it('should fetch cached Trip details', async () => {
      cache.fetch.mockResolvedValue(strippedData);
      const cabDetails = await CabService.getById(1);

      expect(cache.fetch).toHaveBeenCalled();
      expect(cabDetails).toEqual(strippedData);
    });
    it('should return cab data successfully', async () => {
      const cacheSaveSpy = jest.spyOn(cache, 'saveObject');
      cacheSaveSpy.mockResolvedValue(strippedData);
      Cab.findByPk = jest.fn(() => strippedData);
      RemoveDataValues.removeDataValues = jest.fn(() => strippedData);
      const cabDetails = await CabService.getById(1);

      expect(cache.saveObject).toHaveBeenCalled();
      expect(cabDetails).toEqual(strippedData);
    });
    it('should throw error if not in cache', async () => {
      const expectedError = new Error('Could not return the requested cab');
      try {
        await CabService.getById(1);
      } catch (e) {
        expect(e).toEqual(expectedError);
      }
    });
  });

  describe('getCabs', () => {
    const getAllCabsSpy = jest.spyOn(Cab, 'findAll');
    it('should return array of cabs from the db', async () => {
      getAllCabsSpy.mockResolvedValue(mockCabsData.cabs);
      const result = await CabService.getCabs();

      expect(result.pageNo).toBe(1);
      expect(result.cabs.length).toEqual(4);
      expect(result.totalPages).toBe(1);
    });

    it('total items per page should be 2 when size provided is 2', async () => {
      getAllCabsSpy.mockResolvedValue(mockCabsData.cabsFiltered);
      const pageable = { page: 2, size: 2 };
      const result = await CabService.getCabs(pageable);

      expect(result.pageNo).toEqual(2);
      expect(result.cabs.length).toEqual(2);
      expect(result.itemsPerPage).toEqual(2);
    });
    it('pageNo should be 3 when the third page is requested', async () => {
      getAllCabsSpy.mockResolvedValue(mockCabsData.cabsFiltered);
      const pageable = { page: 3, size: 2 };
      const result = await CabService.getCabs(pageable);
      expect(result.pageNo).toBe(3);
      expect(result.cabs.length).toBe(2);
      expect(result.itemsPerPage).toBe(2);
    });
  });

  describe('updateCab', () => {
    const update = jest.spyOn(Cab, 'update');
    it('should update cab details successfully', async () => {
      const mockData = [1, [{ id: 1, driverName: 'Muhwezi Dee' }]];

      update.mockReturnValue(mockData);

      RemoveDataValues.removeDataValues = jest.fn();

      await CabService.updateCab(1, { driverName: 'Muhwezi Dee' });
      expect(update).toBeCalled();
      expect(RemoveDataValues.removeDataValues).toBeCalled();
      expect(RemoveDataValues.removeDataValues).toBeCalledWith(
        { driverName: 'Muhwezi Dee', id: 1 }
      );
    });

    it('should return not found message if cab doesnot exist', async () => {
      const mockData = [1, []];
      update.mockReturnValue(mockData);
      const result = await CabService.updateCab(1, { driverName: 'Muhwezi Dee' });
      expect(result).toEqual({ message: 'Update Failed. Cab does not exist' });
    });

    it('should catch error in updating', async () => {
      try {
        await CabService.updateCab({});
      } catch (error) {
        expect(error.message).toEqual('Could not update cab details');
      }
    });
  });

  describe('deleteCab', () => {
    it('should delete a cab successfully', async () => {
      Cab.destroy = jest.fn(() => 1);

      const result = await CabService.deleteCab(1);
      expect(result).toEqual(1);
    });

    it('should return zero for unexisting data', async () => {
      Cab.destroy = jest.fn(() => 0);

      const result = await CabService.deleteCab(1);
      expect(result).toEqual(0);
    });
  });
});
