import CancelTripController from '../CancelTripController';
import tripService from '../../../../services/TripService';
import models from '../../../../database/models';

const { TripRequest } = models;

describe('cancel trip test', () => {
  beforeEach(() => {
    jest.spyOn(tripService, 'getById').mockResolvedValue();
    jest.spyOn(TripRequest, 'update').mockResolvedValue();
  });
  it('should return trip not found', async (done) => {
    tripService.getById.mockResolvedValue(null);
    const result = await CancelTripController.cancelTrip(300000000);
    expect(result.text).toBe('Trip not found');
    done();
  });

  it('should return success', async (done) => {
    jest.spyOn(tripService, 'getById')
      .mockImplementation(id => Promise.resolve({ id, name: 'Test Trip', approvedById: 4 }));
    jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});

    const result = await CancelTripController.cancelTrip(1);

    expect(tripService.getById).toHaveBeenCalledWith(1);
    expect(tripService.updateRequest).toHaveBeenCalledWith(1,
      { tripStatus: 'Cancelled' });

    expect(result.text).toBe('Success! Your Trip request has been cancelled');
    done();
  });

  it('should handle error', async (done) => {
    const err = new Error('dummy message');
    tripService.getById.mockRejectedValue(err);
    const result = await CancelTripController.cancelTrip(1);
    expect(result.text).toBe(`Request could not be processed, ${err.message}`);
    done();
  });
});
