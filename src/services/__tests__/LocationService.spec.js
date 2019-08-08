import LocationService from '../LocationService';
import models from '../../database/models';

const { Location } = models;
describe('Locationservice_findlocation', () => {
  const mockLocationData = {
    id: 1, longitude: -1.2345, latitude: 1.5673
  };
  it('should raise error when having invalid parameters', async () => {
    jest.spyOn(Location, 'findOne').mockResolvedValue(mockLocationData);
    try {
      await LocationService.findLocation(1, 1, true);
    } catch (error) {
      expect(error.message).toBe('Could not find location record');
    }
  });
});
