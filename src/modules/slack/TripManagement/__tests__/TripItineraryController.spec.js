import TripItineraryController from '../TripItineraryController';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import TripItineraryHelper from '../../helpers/slackHelpers/TripItineraryHelper';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';


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
    SlackHelpers.getUserBySlackId = jest.fn(() => Promise.resolve({ id: 'id' }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should test handleTripHistory return no trip history', async (done) => {
    const payload = { user: { id: 'TEST1' } };

    await TripItineraryController.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalled();
    done();
  });

  it('should test handleTripHistory return no trip history for last 30 days', async (done) => {
    const payload = { user: { id: 'TEST1234' } };

    await TripItineraryController.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalled();
    done();
  });

  it('should test handleTripHistory', async (done) => {
    TripItineraryHelper.getTripRequests = jest.fn(() => Promise.resolve([{
      departureTime: '2019-01-17 01:00:00+01'
    }]));
    const payload = { user: { id: 'TEST123' } };
    
    await TripItineraryController.handleTripHistory(payload, respond);
    expect(InteractivePrompts.sendTripHistory).toHaveBeenCalled();
    done();
  });

  it('should test handleTripHistory and catch error', async (done) => {
    const payload = { user: { id: 100000 } };

    await TripItineraryController.handleTripHistory(payload, respond);
    expect(respond).toHaveBeenCalled();
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

    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalled();
    done();
  });

  it('should test handleUpcomingTrips return no upcoming trips', async (done) => {
    const payload = { user: { id: 'TEST1234' }, actions: [{ name: 'upcoming_trips' }] };

    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalled();
    done();
  });

  it('should test handleUpcomingTrips', async (done) => {
    TripItineraryHelper.getPaginatedTripRequestsBySlackUserId = jest.fn(() => Promise.resolve({
      getPageNo: jest.fn(() => {}),
      getTotalPages: jest.fn(() => {}),
      getPageItems: jest.fn(() => [{ value: 'value' }])
    }));

    const payload = { user: { id: 'TEST123' }, actions: [{ name: 'upcoming_trips' }] };

    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(InteractivePrompts.sendUpcomingTrips).toHaveBeenCalled();
    done();
  });

  it('should test handleUpcomingTrips if request contains page number', async (done) => {
    TripItineraryHelper.getPaginatedTripRequestsBySlackUserId = jest.fn(() => Promise.resolve({
      getPageNo: jest.fn(() => {}),
      getTotalPages: jest.fn(() => {}),
      getPageItems: jest.fn(() => [{ value: 'value' }])
    }));
    const payload = { user: { id: 'TEST123' }, actions: [{ name: 'upcoming_trips' }], submission: { pageNumber: '1' } };

    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(InteractivePrompts.sendUpcomingTrips).toHaveBeenCalled();
    done();
  });
  it('should test handleUpcomingTrips and catch error', async (done) => {
    const payload = { user: { id: 100000 }, actions: [{ name: 'upcoming_trips' }] };

    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalled();
    done();
  });
  it('should handle error when tripHistory payload is undefined', async () => {
    const payload = { user: { id: 'TEST123' }, submission: { pageNumber: 1 } };
    jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId').mockImplementationOnce(() => false);
    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(respond).toHaveBeenCalled();
  });

  it('should sendSkipPage dialog', async () => {
    TripItineraryHelper.getPaginatedTripRequestsBySlackUserId = jest.fn(() => Promise.resolve({
      getPageNo: jest.fn(() => {}),
      getTotalPages: jest.fn(() => {}),
      getPageItems: jest.fn(() => [{ value: 'value' }])
    }));
    const payload = { user: { id: 'TEST123' }, actions: [{ name: 'skipPage' }] };
    DialogPrompts.sendSkipPage = jest.fn().mockResolvedValueOnce({});
    await TripItineraryController.handleUpcomingTrips(payload, respond);
    expect(DialogPrompts.sendSkipPage).toHaveBeenCalled();
  });
});
