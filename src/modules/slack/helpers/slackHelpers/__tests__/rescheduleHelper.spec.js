import tripService from '../../../../../services/TripService';
import TripRescheduleHelper from '../rescheduleHelper';
import DialogPrompts from '../../../SlackPrompts/DialogPrompts';
import InteractivePromptSlackHelper from '../InteractivePromptSlackHelper';


jest.mock('../../../SlackPrompts/Notifications.js');
jest.mock('../../../events/', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));
jest.mock('../../../events/slackEvents', () => ({
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

describe('Trip Reschedule Helper test', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should send Reschedule Trip Form ', async (done) => {
    const twoHoursAfter = new Date(Date.now() + 2 * 60 * 60 * 1000);
    jest.spyOn(tripService, 'getById').mockResolvedValue({
      confirmedById: 0,
      departureTime: `${twoHoursAfter.toISOString()}`
    });
    const sendRescheduleTripFormSpy = jest.spyOn(DialogPrompts, 'sendRescheduleTripForm').mockResolvedValue();

    const payload = {};
    const response = jest.fn();
    await TripRescheduleHelper.sendTripRescheduleDialog(payload, response, 12);
    expect(sendRescheduleTripFormSpy).toBeCalledTimes(1);

    done();
  });

  it('should send reschedule confirm error when trip is < 1hr before the departure time',
    async () => {
      const oneHourAfter = new Date(Date.now() - 60 * 60 * 1000);
      jest.spyOn(tripService, 'getById')
        .mockResolvedValue({
          departureTime: `${oneHourAfter.toISOString()}`
        });
      const spy = jest.spyOn(InteractivePromptSlackHelper, 'passedTimeOutLimit');

      const payload = {};
      const response = jest.fn();
      await TripRescheduleHelper.sendTripRescheduleDialog(payload, response, 12);
      expect(spy).toHaveBeenCalledTimes(1);
    });

  it('should send reschedule confirm or approve error when trip has been approved', async () => {
    const twoHourBefore = new Date(Date.now() + 2 * 60 * 60 * 1000);
    jest.spyOn(tripService, 'getById')
      .mockResolvedValue({
        approvedById: 1,
        // Set departure time to two hour from the current time.
        departureTime: `${twoHourBefore.toISOString()}`
      });
    const spy = jest.spyOn(InteractivePromptSlackHelper, 'rescheduleConfirmedApprovedError');

    const payload = {};
    const response = jest.fn();
    await TripRescheduleHelper.sendTripRescheduleDialog(payload, response, 12);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should handle unexpected errors', async () => {
    jest.spyOn(tripService, 'getById').mockRejectedValue();
    const spy = jest.spyOn(InteractivePromptSlackHelper, 'sendTripError');

    const payload = {};
    const response = jest.fn();
    await TripRescheduleHelper.sendTripRescheduleDialog(payload, response, 12);
    expect(spy).toBeCalledTimes(1);
  });
});
