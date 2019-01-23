import TripItineraryHelper from '../TripItineraryHelper';

describe('should test trip Itinerary controller', () => {
  it('should return trip requests', async (done) => {
    try {
      await TripItineraryHelper.getTripRequests('a');
    } catch (error) {
      expect(error.message).toEqual('invalid input syntax for integer: "a"');
    }
    done();
  });
});
