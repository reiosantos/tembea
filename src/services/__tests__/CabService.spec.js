import CabService from '../CabService';
import models from '../../database/models';

const { Cab } = models;

describe('CabService', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
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
      expect(cab.driverName).toEqual('Hello');
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
});
