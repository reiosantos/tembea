import CancelTripController from '../CancelTripController';

describe('cancel trip test', () => {
  it('should return trip not found', async (done) => {
    const result = await CancelTripController.cancelTrip(300000);
    expect(result).toBe('Trip not found');
    done();
  });

  it('should return trip not found', async (done) => {
    const result = await CancelTripController.cancelTrip(1);
    expect(result).toBe('Success! Your Trip request has been cancelled');
    done();
  });
});
