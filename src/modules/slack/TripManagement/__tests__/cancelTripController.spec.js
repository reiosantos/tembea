import CancelTripController from '../CancelTripController';
import models from '../../../../database/models';

describe('cancel trip test', () => {
  it('should return trip not found', async (done) => {
    const result = await CancelTripController.cancelTrip(300000000);
    expect(result).toBe('Trip not found');
    done();
  });

  it('should return success', async (done) => {
    const result = await CancelTripController.cancelTrip(1);
    expect(result).toBe('Success! Your Trip request has been cancelled');
    done();
  });

  it('should handle error', async (done) => {
    const { TripRequest } = models;
    const err = new Error('dummy message');
    TripRequest.findById = jest.fn(() => Promise.reject(err));
    const result = await CancelTripController.cancelTrip(1);
    expect(result).toBe(`Request could not be processed, ${err.message}`);
    done();
  });
});
