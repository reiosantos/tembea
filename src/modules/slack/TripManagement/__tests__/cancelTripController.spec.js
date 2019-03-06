import CancelTripController from '../CancelTripController';
import tripService from '../../../../services/TripService';

describe('cancel trip test', () => {
  it('should return trip not found', async (done) => {
    const result = await CancelTripController.cancelTrip(300000000);
    expect(result.text).toBe('Trip not found');
    done();
  });

  it('should return success', async (done) => {
    const result = await CancelTripController.cancelTrip(1);
    expect(result.text).toBe('Success! Your Trip request has been cancelled');
    done();
  });

  it('should handle error', async (done) => {
    const err = new Error('dummy message');
    tripService.getById = jest.fn(() => Promise.reject(err));
    const result = await CancelTripController.cancelTrip(1);
    expect(result.text).toBe(`Request could not be processed, ${err.message}`);
    done();
  });
});
