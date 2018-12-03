import TripItineraryHelper, { tripResponse } from '../TripItineraryHelper';
import InteractivePrompts from '../../../SlackPrompts/InteractivePrompts';

describe('Trip Itinerary Helpers Test', () => {
  let respond;

  beforeEach(() => {
    respond = jest.fn(value => value);
  });

  it('should test handleTripHistory return no trip history', async (done) => {
    const payload = { user: { id: 'TEST1' } };
    const respondMessage = tripResponse('You have no trip history');

    await TripItineraryHelper.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleTripHistory return no trip history for last 30 days', async (done) => {
    const payload = { user: { id: 'TEST1234' } };
    const respondMessage = tripResponse('You have no trip history for the last 30 days');
    await TripItineraryHelper.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleTripHistory', async (done) => {
    const payload = { user: { id: 'TEST123' } };
    InteractivePrompts.sendTripHistory = jest.fn(value => value);

    await TripItineraryHelper.handleTripHistory(payload, respond);
    expect(InteractivePrompts.sendTripHistory).toHaveBeenCalled();
    done();
  });

  it('should test handleTripHistory and catch error', async (done) => {
    const payload = { user: { id: 100000 } };
    const respondMessage = tripResponse(
      'Request could not be processed! operator does not exist: character varying = integer'
    );
    await TripItineraryHelper.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleUpcomingTrips return no  upcoming trips', async (done) => {
    const payload = { user: { id: 'TEST1' } };
    const respondMessage = tripResponse('You have no upcoming trips');

    await TripItineraryHelper.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleUpcomingTrips return no upcoming trips', async (done) => {
    const payload = { user: { id: 'TEST1234' } };
    const respondMessage = tripResponse('You have no upcoming trips');

    await TripItineraryHelper.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleUpcomingTrips', async (done) => {
    const payload = { user: { id: 'TEST123' } };

    InteractivePrompts.sendUpcomingTrips = jest.fn(value => value);
    await TripItineraryHelper.handleUpcomingTrips(payload, respond);
    expect(InteractivePrompts.sendUpcomingTrips).toHaveBeenCalled();
    done();
  });

  it('should test handleUpcomingTrips and catch error', async (done) => {
    const payload = { user: { id: 100000 } };
    const respondMessage = tripResponse(
      'Request could not be processed! operator does not exist: character varying = integer'
    );
    await TripItineraryHelper.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });
});
