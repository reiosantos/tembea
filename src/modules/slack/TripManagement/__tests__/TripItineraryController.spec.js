import TripItineraryController, { responseMessage, triggerPage, getPageNumber } from '../TripItineraryController';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import TripItineraryHelper from '../../helpers/slackHelpers/TripItineraryHelper';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
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
  const tripsPayload = {
    data: [
      {
        id: 1,
        name: 'Abuja'
      },
      {
        id: 2,
        name: 'Nairobi'
      }
    ],
    pageMeta: {
      totalPages: 3,
      pageNo: 1
    }
  };

  beforeEach(() => {
    respond = jest.fn((value) => value);
    jest.spyOn(InteractivePrompts, 'sendTripHistory').mockImplementationOnce((value) => value);
    jest.spyOn(InteractivePrompts, 'sendUpcomingTrips').mockImplementationOnce((value) => value);
    jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId')
      .mockImplementation((slackId) => Promise.resolve({
        slackId, name: 'test user'
      }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('TripItineraryController_handleTripHistory', () => {
    it('should not get trip history', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce(tripsPayload);
      const payload = {
        user: { id: 'TEST1' },
        team: { id: 'testId' },
        actions: [{ name: 'history' }]
      };
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
      const tripsMock = { ...tripsPayload };
      tripsMock.data = [];
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce(tripsMock);

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
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce(tripsPayload);
      const payload = {
        user: { id: 'TEST2' },
        team: { id: 'testId' },
        actions: [{ name: 'upcoming' }]
      };
      await TripItineraryController.handleUpcomingTrips(payload, respond);
      expect(InteractivePrompts.sendUpcomingTrips).toHaveBeenCalled();
    });

    it('should not get upcoming trip when something goes wrong', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce();
      const payload = {
        user: { id: 'TEST1' },
        team: { id: 'testId' },
        actions: [{ name: 'upcoming' }]
      };
      await TripItineraryController.handleUpcomingTrips(payload, respond);
      expect(respond).toHaveBeenCalledWith(responseMessage('Something went wrong getting trips'));
    });

    it('should respond with a message when user does not have any trip', async () => {
      const tripsMock = { ...tripsPayload };
      tripsMock.data = [];
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockResolvedValueOnce(tripsMock);
      const payload = {
        user: { id: 'TEST1' },
        team: { id: 'testId' },
        actions: [{ name: 'upcoming' }]
      };
      await TripItineraryController.handleUpcomingTrips(payload, respond);
      expect(respond).toHaveBeenCalledWith(responseMessage('You have no upcoming trips'));
    });

    it('should catch an error when something goes wrong while getting upcoming trip', async () => {
      jest.spyOn(TripItineraryHelper, 'getPaginatedTripRequestsBySlackUserId')
        .mockRejectedValueOnce(new Error('Database Error'));
      const payload = {
        user: { id: 'TEST1' },
        team: { id: 'testId' },
        actions: [{ name: 'upcoming' }]
      };
      await TripItineraryController.handleUpcomingTrips(payload, respond);
      expect(respond).toHaveBeenCalledWith(
        responseMessage('Could not be processed! Database Error')
      );
    });
  });

  describe('TripItineraryController  triggerPage', () => {
    it('should sendSkipPage dialog', () => {
      jest.spyOn(DialogPrompts, 'sendSkipPage').mockReturnValue();

      const payload = {
        user: { id: 'TEST123' },
        actions: [{ name: 'skipPage' }]
      };
      triggerPage(payload, respond);
      expect(DialogPrompts.sendSkipPage).toHaveBeenCalled();
    });
  });

  describe('TripItineraryController  getPageNumber', () => {
    beforeEach(() => jest.spyOn(SlackPagination, 'getPageNumber'));

    it('should return a number', () => {
      const payload = {
        submission: 1,
        user: { id: 'TEST123' },
        actions: [{ name: 'page_1' }]
      };
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
