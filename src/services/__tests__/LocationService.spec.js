import LocationService from '../LocationService';

describe('Locationservice_findlocation', () => {
  it('should raise error when having invalid parameters', async (done) => {
    try {
      await LocationService.findLocation(1, 1, true);
    } catch (error) {
      expect(error.message).toBe('Could not find location record');
    }
    done();
  });
});
