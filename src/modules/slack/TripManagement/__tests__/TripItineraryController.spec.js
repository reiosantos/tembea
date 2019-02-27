import TripItineraryController, { responseMessage, triggerSkipPage, getPageNumber } from '../TripItineraryController';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import TripItineraryHelper from '../../helpers/slackHelpers/TripItineraryHelper';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import SequelizePaginationHelper from '../../../../helpers/sequelizePaginationHelper';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import SlackPagination from '../../../../helpers/slack/SlackPaginationHelper';

jest.mock('../../events/', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));


describe('TripItineraryController', () => {
  let respond;
  const trip = new SequelizePaginationHelper();
  beforeEach(() => {
    respond = jest.fn(value => value);

    jest.spyOn(trip, 'getPageItems').mockResolvedValue({ data: [{}, {}], pageMeta: {} });
    jest.spyOn(trip, 'getPageNo').mockResolvedValue(1);
    jest.spyOn(trip, 'getTotalPages').mockResolvedValue(1);

    jest.spyOn(DialogPrompts, 'sendSkipPage').mockImplementation(value => value);
    jest.spyOn(SlackPagination, 'getPageNumber').mockImplementation();
    jest.spyOn(InteractivePrompts, 'sendTripHistory').mockImplementationOnce(value => value);
    jest.spyOn(InteractivePrompts, 'sendUpcomingTrips').mockImplementationOnce(value => value);
    jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId').mockResolvedValueOnce();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('TripItineraryController_handleTripHistory', () => {
    it('should not get trip history', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce(trip);
      const payload = { user: { id: 'TEST1' }, team: { id: 'testId' }, actions: [{ name: 'history' }] };
      await TripItineraryController.handleTripHistory(payload, respond);
      expect(InteractivePrompts.sendTripHistory).toHaveBeenCalled();
    });

    it('should not get trip history when something goes wrong', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce();
      const payload = { user: { id: 'TEST1' }, team: { id: 'testId' }, actions: [{ name: 'history' }] };
      await TripItineraryController.handleTripHistory(payload, respond);
      expect(respond).toHaveBeenCalledWith(responseMessage('Could not get trip history'));
    });

    it('should respond with a message when user does not have any trip', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce(trip);
      trip.getPageItems.mockResolvedValue({ data: [], pageMeta: {} });
      const payload = { user: { id: 'TEST1' }, team: { id: 'testId' }, actions: [{ name: 'history' }] };
      await TripItineraryController.handleTripHistory(payload, respond);
      expect(respond).toHaveBeenCalledWith(responseMessage('You have no trip history'));
    });

    it('should catch an error when something goes wrong while getting trip history', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockRejectedValueOnce(new Error('Database Error'));
      const payload = { user: { id: 'TEST1' }, team: { id: 'testId' }, actions: [{ name: 'history' }] };
      await TripItineraryController.handleTripHistory(payload, respond);
      expect(respond).toHaveBeenCalledWith(responseMessage('Could not be processed! Database Error'));
    });
  });

  describe('TripItineraryController_handleUpcomingTrips', () => {
    it('should not get upcoming trip', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId').mockResolvedValueOnce(trip);
      const payload = { user: { id: 'TEST2' }, team: { id: 'testId' }, actions: [{ name: 'upcoming' }] };
      await TripItineraryController.handleUpcomingTrips(payload, respond);
      expect(InteractivePrompts.sendUpcomingTrips).toHaveBeenCalled();
    });

    it('should not get upcoming trip when something goes wrong', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId').mockResolvedValueOnce();
      const payload = { user: { id: 'TEST1' }, team: { id: 'testId' }, actions: [{ name: 'upcoming' }] };
      await TripItineraryController.handleUpcomingTrips(payload, respond);
      expect(respond).toHaveBeenCalledWith(responseMessage('Something went wrong getting trips'));
    });

    it('should respond with a message when user does not have any trip', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce(trip);
      trip.getPageItems.mockResolvedValue({ data: [], pageMeta: { } });
      const payload = { user: { id: 'TEST1' }, team: { id: 'testId' }, actions: [{ name: 'upcoming' }] };
      await TripItineraryController.handleUpcomingTrips(payload, respond);
      expect(respond).toHaveBeenCalledWith(responseMessage('You have no upcoming trips'));
    });

    it('should catch an error when something goes wrong while getting upcoming trip', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockRejectedValueOnce(new Error('Database Error'));
      const payload = { user: { id: 'TEST1' }, team: { id: 'testId' }, actions: [{ name: 'upcoming' }] };
      await TripItineraryController.handleUpcomingTrips(payload, respond);
      expect(respond).toHaveBeenCalledWith(responseMessage('Could not be processed! Database Error'));
    });
  });

  describe('TripItineraryController  triggerSkipPage', () => {
    it('should sendSkipPage dialog', () => {
      const payload = { user: { id: 'TEST123' }, actions: [{ name: 'skipPage' }] };
      triggerSkipPage(payload, respond);
      expect(DialogPrompts.sendSkipPage).toHaveBeenCalled();
    });
  });

  describe('TripItineraryController  getPageNumber', () => {
    it('should return a number', () => {
      const payload = { submission: 1, user: { id: 'TEST123' }, actions: [{ name: 'page_1' }] };
      const res = getPageNumber(payload);
      expect(res).toBeGreaterThanOrEqual(1);
      expect(SlackPagination.getPageNumber).toHaveBeenCalled();
    });

    it('should return a default value of one', () => {
      const payload = { actions: [{ name: 'page_1' }] };
      const res = getPageNumber(payload);
      expect(res).toEqual(1);
    });
  });
});
