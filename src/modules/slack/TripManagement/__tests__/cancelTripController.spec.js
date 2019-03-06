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
    const update = jest.fn();
    tripService.getById.mockResolvedValue({ update });
    const result = await CancelTripController.cancelTrip(1);
    expect(tripService.getById).toHaveBeenCalledWith(1);
    expect(TripRequest.update).toHaveBeenCalledWith(
      { tripStatus: 'Cancelled' },
      { where: { id: 1 }, returning: true }
    );
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
