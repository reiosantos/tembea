import CancelTripController from '../CancelTripController';
import tripService from '../../../../services/TripService';
import database from '../../../../database';

const { models: { TripRequest } } = database;

const mockTrip = {
  name: 'test trip',
  approvedById: 4,
  id: 1,
  origin: { address: 'Nairobi' },
  destination: { address: 'Thika' }
};

describe('cancel trip test', () => {
  beforeEach(() => {
    jest.spyOn(tripService, 'getById').mockResolvedValue();
    jest.spyOn(TripRequest, 'update').mockResolvedValue();
  });
  it('should return trip not found', async () => {
    tripService.getById.mockResolvedValue(null);
    const result = await CancelTripController.cancelTrip(300000000);
    expect(result.text).toBe('Trip not found');
  });

  it('should return success', async () => {
    jest.spyOn(tripService, 'getById')
      .mockImplementation(() => Promise.resolve(mockTrip));
    jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});

    const result = await CancelTripController.cancelTrip(1);

    expect(tripService.getById).toHaveBeenCalledWith(1);
    expect(tripService.updateRequest).toHaveBeenCalledWith(1,
      { tripStatus: 'Cancelled' });

    expect(result.text).toBe('Success! Your Trip request from Nairobi to Thika has been cancelled');
  });

  it('should handle error', async () => {
    const err = new Error('dummy message');
    tripService.getById.mockRejectedValue(err);
    const result = await CancelTripController.cancelTrip(1);
    expect(result.text).toBe(`Request could not be processed, ${err.message}`);
  });
});
