import TripItineraryController, { tripResponse } from '../TripItineraryController';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import TripItineraryHelper from '../../helpers/slackHelpers/TripItineraryHelper';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';


jest.mock('../../SlackPrompts/Notifications');
jest.mock('../../events/', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));
jest.mock('../../events/slackEvents', () => ({
  SlackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
  slackEventNames: Object.freeze({
    TRIP_APPROVED: 'trip_approved',
    TRIP_WAITING_CONFIRMATION: 'trip_waiting_confirmation',
    NEW_TRIP_REQUEST: 'new_trip_request',
    DECLINED_TRIP_REQUEST: 'declined_trip_request'
  })
}));

describe('Trip Itinerary Helpers Test', () => {
  let respond;

  beforeEach(() => {
    respond = jest.fn(value => value);
    jest.spyOn(InteractivePrompts, 'sendTripHistory').mockImplementationOnce(value => value);
    jest.spyOn(InteractivePrompts, 'sendUpcomingTrips').mockImplementationOnce(value => value);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should test handleTripHistory return no trip history', async (done) => {
    const payload = { user: { id: 'TEST1' } };
    const respondMessage = tripResponse('You have no trip history');

    await TripItineraryController.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleTripHistory return no trip history for last 30 days', async (done) => {
    const payload = { user: { id: 'TEST1234' } };
    const respondMessage = tripResponse('You have no trip history for the last 30 days');
    await TripItineraryController.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleTripHistory', async (done) => {
    const payload = { user: { id: 'TEST123' } };

    await TripItineraryController.handleTripHistory(payload, respond);
    expect(InteractivePrompts.sendTripHistory).toHaveBeenCalled();
    done();
  });

  it('should test handleTripHistory and catch error', async (done) => {
    const payload = { user: { id: 100000 } };
    const respondMessage = tripResponse(
      'Request could not be processed! operator does not exist: character varying = integer'
    );
    await TripItineraryController.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleUpcomingTrips return no  upcoming trips history', async (done) => {
    const payload = { user: { id: 'TEST123456' }, actions: [{ name: 'trip_history' }] };
    jest.spyOn(
      TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId'
    ).mockImplementation().mockResolvedValueOnce({
      getPageNo: () => (Promise.resolve(1)),
      getTotalPages: () => (2),
      getPageItems: () => (Promise.resolve([]))
    });
    const respondMessage = tripResponse('You have no upcoming trips');
    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleUpcomingTrips return no upcoming trips', async (done) => {
    const payload = { user: { id: 'TEST1234' }, actions: [{ name: 'upcoming_trips' }] };
    const respondMessage = tripResponse('You have no upcoming trips');

    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });

  it('should test handleUpcomingTrips', async (done) => {
    const payload = { user: { id: 'TEST123' }, actions: [{ name: 'upcoming_trips' }] };
    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(InteractivePrompts.sendUpcomingTrips).toHaveBeenCalled();
    done();
  });

  it('should test handleUpcomingTrips if request contains page number', async (done) => {
    const payload = { user: { id: 'TEST123' }, actions: [{ name: 'upcoming_trips' }], submission: { pageNumber: '1' } };

    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(InteractivePrompts.sendUpcomingTrips).toHaveBeenCalled();
    done();
  });
  it('should test handleUpcomingTrips and catch error', async (done) => {
    const payload = { user: { id: 100000 }, actions: [{ name: 'upcoming_trips' }] };
    const respondMessage = tripResponse(
      'Request could not be processed! operator does not exist: character varying = integer'
    );
    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalledWith(respondMessage);
    done();
  });
  it('should handle error when tripHistory payload is undefined', async () => {
    const payload = { user: { id: 'TEST123' }, submission: { pageNumber: 1 } };
    jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId').mockImplementationOnce(() => false);
    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalled();
  });

  it('should sendSkipPage dialog', async () => {
    const payload = { user: { id: 'TEST123' }, actions: [{ name: 'skipPage' }] };
    DialogPrompts.sendSkipPage = jest.fn().mockResolvedValueOnce({});
    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(DialogPrompts.sendSkipPage).toHaveBeenCalled();
  });
});
