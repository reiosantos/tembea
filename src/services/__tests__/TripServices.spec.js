/* eslint-disable indent */
import TripServices from '../TripServices';

describe('Trip service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should find trip', async (done) => {
        await TripServices.findTrip(1);
        done();
    });
    it('should fail to find trip', async (done) => {
        await TripServices.findTrip(null);
        done();
    });
});
