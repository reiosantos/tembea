import TripItineraryHelper from '../TripItineraryHelper';
import slackHelpers from '../../../../../helpers/slack/slackHelpers';

describe('should test trip Itinerary controller', () => {
  it('should return trip requests', async (done) => {
    const user = await slackHelpers.getUserBySlackId('TEST123');
    const result = await TripItineraryHelper.getTripRequests(user.id);
    expect(result[0]['requester.name']).toEqual('Test buddy 1');
    done();
  });

  it('should return trip requests', async (done) => {
    try {
      await TripItineraryHelper.getTripRequests('a');
    } catch (error) {
      expect(error.message).toEqual('invalid input syntax for integer: "a"');
    }
    done();
  });
});
