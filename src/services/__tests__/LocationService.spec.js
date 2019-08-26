import LocationService from '../LocationService';
import database from '../../database';
import BugsnagHelper from '../../helpers/bugsnagHelper';

const { models: { Location } } = database;
describe('Locationservice', () => {
  let findLocationSpy;
  let findOrCreateLocationSpy;
  const mockLocationData = {
    id: 1, longitude: -1.2345, latitude: 1.5673
  };

  beforeEach(() => {
    findLocationSpy = jest.spyOn(Location, 'findOne');
    findOrCreateLocationSpy = jest.spyOn(Location, 'findOrCreate');
  });
  describe('findLocation', () => {
    it('should raise error when having invalid parameters', async () => {
      findLocationSpy.mockRejectedValue(new Error('Error'));
      try {
        await LocationService.findLocation(1, 1, true, true);
      } catch (error) {
        expect(error.message).toBe('Could not find location record');
      }
    });

    it('should find location', async () => {
      findLocationSpy.mockResolvedValue(mockLocationData);
      const result = await LocationService.findLocation(1, 1, true, true);
      expect(result).toEqual(mockLocationData);
      expect(Location.findOne).toHaveBeenCalled();
    });
  });
  describe('createLocation', () => {
    const mockReturnedValue = { dataValues: mockLocationData };

    it('should create a new loaction', async () => {
      findOrCreateLocationSpy.mockResolvedValue([mockReturnedValue]);
      await LocationService.createLocation(
        mockLocationData.longitude, mockLocationData.latitude
      );
      expect(Location.findOrCreate).toHaveBeenCalledWith(expect.any(Object));
    });
    it('should throw error', async () => {
      findOrCreateLocationSpy.mockRejectedValue(new Error('Error Message'));
      jest.spyOn(BugsnagHelper, 'log');
      await LocationService.createLocation(
        mockLocationData.longitude
      );
      expect(Location.findOrCreate).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
