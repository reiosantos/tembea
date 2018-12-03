import SlackInteractions from '../index';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import ManageTripController from '../../TripManagement/ManageTripController';
import ScheduleTripController from '../../TripManagement/ScheduleTripController';
import RescheduleTripController from '../../TripManagement/RescheduleTripController';
import CancelTripController from '../../TripManagement/CancelTripController';
import { responseMessage, createPayload, respondMock } from '../__mocks__/SlackInteractions.mock';
import SlackControllerMock from '../../__mocks__/SlackControllerMock';
import TripItineraryHelper from '../../helpers/slackHelpers/TripItineraryHelper';

describe('Manager decline trip interactions', () => {
  beforeAll(() => {
    DialogPrompts.sendDialogToManager = jest.fn(() => { });
  });

  it('should handle manager actions', (done) => {
    SlackInteractions.handleManagerActions({
      original_message: {
        ts: 'XXXXXXX'
      },
      channel: {
        id: 'XXXXXXX'
      },
      actions: [{
        name: 'manager_decline',
        value: 3
      }]
    });

    expect(DialogPrompts.sendDialogToManager.mock.calls.length).toBe(1);
    done();
  });

  it('should catch payload error', (done) => {
    SlackInteractions.handleManagerActions({
      actions: [{
        name: 'manager_decline',
        value: 3
      }]
    }, (res) => {
      expect(res).toEqual({
        attachments: undefined,
        channel: undefined,
        response_type: 'ephemeral',
        text: 'Error:bangbang:: I was unable to do that.'
      });
      done();
    });
  });
});

describe('Manager decline trip', () => {
  beforeAll(() => {
    ManageTripController.declineTrip = jest.fn(() => {});
  });

  it('should handle empty decline message', async (done) => {
    const res = await SlackInteractions.handleTripDecline({
      submission: {
        declineReason: '        '
      },
      state: ''
    });

    expect(res.errors.length).toBe(1);
    expect(res.errors[0]).toEqual({ name: 'declineReason', error: 'This field cannot be empty' });
    done();
  });

  it('should handle trip decline', async (done) => {
    await SlackInteractions.handleTripDecline({
      submission: {
        declineReason: 'Just a funny reason'
      },
      state: ''
    });

    expect(ManageTripController.declineTrip.mock.calls.length).toBe(1);
    done();
  });
});

describe('Error handling for manager decline', () => {
  it('should catch unexpected errors', async (done) => {
    await SlackInteractions.handleTripDecline(
      {
        submission: {
          declineReason: {}
        },
        state: ''
      },
      (res) => {
        expect(res).toEqual({
          attachments: undefined,
          channel: undefined,
          response_type: 'ephemeral',
          text: 'Error:bangbang:: Something went wrong! Please try again.'
        });
        done();
      }
    );
  });
});

describe('Slack Interactions test: Launch and Welcome Message switch', () => {
  let respond;

  beforeEach(() => {
    respond = respondMock();
  });

  it('should test back_to_launch', (done) => {
    const payload = createPayload('back_to_launch');
    const result = SlackInteractions.launch(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalledWith(SlackControllerMock);
    done();
  });

  it('should test launch default response', (done) => {
    const payload = createPayload();
    const result = SlackInteractions.launch(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalledWith(responseMessage());
    done();
  });

  it('should test book_new_trip action', (done) => {
    const payload = createPayload('book_new_trip');
    const result = SlackInteractions.welcomeMessage(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toBeCalled();
    done();
  });

  it('should test view_trips_itinerary action', () => {
    const payload = createPayload('view_trips_itinerary');
    const result = SlackInteractions.welcomeMessage(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toBeCalled();
  });

  it('should test view_available_routes action', (done) => {
    const payload = createPayload('view_available_routes');
    const result = SlackInteractions.welcomeMessage(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalledWith(responseMessage('Available routes will be shown soon.'));
    done();
  });

  it('should test Welcome message default action', (done) => {
    const payload = createPayload();
    const result = SlackInteractions.welcomeMessage(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalledWith(responseMessage());
    done();
  });
});

describe('Slack Interactions test: book new Trip switch', () => {
  let respond;

  beforeEach(() => {
    respond = respondMock();
    DialogPrompts.sendTripDetailsForm = jest.fn((value1, value2) => ({ value1, value2 }));
  });

  it('should test book new trip action', (done) => {
    const payload = createPayload('true');
    const result = SlackInteractions.bookNewTrip(payload, respond);
    expect(result).toBe(undefined);
    expect(DialogPrompts.sendTripDetailsForm).toHaveBeenCalledWith(payload, 'true');
    done();
  });

  it('should test book new trip default action', (done) => {
    const payload = createPayload();
    const result = SlackInteractions.bookNewTrip(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalledWith(
      responseMessage('Thank you for using Tembea. See you again.')
    );
    done();
  });
});

describe('Handle user Inputs test', () => {
  let handleRespond;
  const expectedErrorResponse = [{ error: 'error1' }];

  beforeEach(() => {
    ScheduleTripController.createRequest = jest.fn(() => 1);
    handleRespond = respondMock();
  });

  it('should return an error if it exists', async (done) => {
    ScheduleTripController.runValidations = jest.fn(() => expectedErrorResponse);
    const result = await SlackInteractions.handleUserInputs('payload', 'respond');
    expect(result).toEqual({ errors: expectedErrorResponse });
    done();
  });

  it('should handle user inputs', async (done) => {
    ScheduleTripController.runValidations = jest.fn(() => []);
    const result = await SlackInteractions.handleUserInputs('payload', handleRespond);
    expect(result).toBe(undefined);
    expect(ScheduleTripController.runValidations.mock.calls.length).toBe(1);
    done();
  });

  it('should handle user inputs', async (done) => {
    ScheduleTripController.runValidations = jest.fn(() => ([]));

    const result = await SlackInteractions.handleUserInputs('payload', handleRespond);
    expect(result).toBe(undefined);
    done();
  });
});

describe('HandleItineraryActions function', () => {
  let itineraryRespond;

  beforeEach(() => {
    itineraryRespond = respondMock();
    DialogPrompts.sendRescheduleTripForm = jest.fn();
  });

  it('should respond with coming soon', async (done) => {
    const payload = createPayload('value', 'view');

    const result = await SlackInteractions.handleItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(itineraryRespond).toHaveBeenCalledWith({ text: 'Coming soon...' });
    done();
  });

  it('should trigger reschedule dialog', async (done) => {
    const payload = createPayload('value', 'reschedule');

    const result = await SlackInteractions.handleItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    done();
  });

  it('should trigger cancel trip', async (done) => {
    const payload = createPayload(1, 'cancel_trip');
    CancelTripController.cancelTrip = jest.fn(() => Promise.resolve('message'));

    const result = await SlackInteractions.handleItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(itineraryRespond).toHaveBeenCalledWith(
      responseMessage('message')
    );
    done();
  });

  it('should trigger cancel trip', async (done) => {
    const payload = createPayload(1, 'trip');
    CancelTripController.cancelTrip = jest.fn(() => Promise.resolve('message'));

    const result = await SlackInteractions.handleItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(itineraryRespond).toHaveBeenCalledWith(
      responseMessage('Thank you for using Tembea. See you again.')
    );
    done();
  });
});

describe('test handle reschedule function', () => {
  let rescheduleRespond;
  const expectedErrorResponse = [{ error: 'error1' }];
  const response = 'request submitted';

  beforeEach(() => {
    rescheduleRespond = respondMock();
  });

  it('should test reschedule switch interaction', async (done) => {
    RescheduleTripController.runValidations = jest.fn(() => (expectedErrorResponse));
    RescheduleTripController.rescheduleTrip = jest.fn(() => response);
    const payload = {
      state: 'reschedule boy',
      submission: {
        new_month: 11,
        new_date: 22,
        new_year: 2019
      },
      user: 'user'
    };
    const result = await SlackInteractions.handleReschedule(payload, rescheduleRespond);
    expect(result).toEqual({ errors: expectedErrorResponse });
    done();
  });

  it('should test reschedule switch interaction', async (done) => {
    RescheduleTripController.runValidations = jest.fn(() => ([]));
    RescheduleTripController.rescheduleTrip = jest.fn(() => response);
    const payload = {
      state: 'reschedule boy',
      submission: {
        new_month: 11,
        new_date: 22,
        new_year: 2019
      },
      user: 'user'
    };
    const result = await SlackInteractions.handleReschedule(payload, rescheduleRespond);
    expect(result).toEqual(undefined);
    expect(rescheduleRespond).toHaveBeenCalledWith(response);
    done();
  });

  it('should test reschedule switch interaction', async (done) => {
    RescheduleTripController.runValidations = jest.fn(() => ([]));
    RescheduleTripController.rescheduleTrip = jest.fn(() => response);
    const payload = {
      state: 'boy',
      submission: {
        new_month: 11,
        new_date: 22,
        new_year: 2019
      },
      user: 'user'
    };
    const result = await SlackInteractions.handleReschedule(payload, rescheduleRespond);
    expect(result).toEqual(undefined);
    expect(rescheduleRespond).toHaveBeenCalledWith('request submitted');
    done();
  });
});

describe('test viewTripItineraryActions switch', () => {
  let itineraryRespond;

  beforeEach(() => {
    itineraryRespond = respondMock();
    TripItineraryHelper.handleTripHistory = jest.fn();
    TripItineraryHelper.handleUpcomingTrips = jest.fn();
  });

  it('should test view_trips_history case', async (done) => {
    const payload = createPayload('view_trips_history');

    const result = await SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(TripItineraryHelper.handleTripHistory).toHaveBeenCalled();
    done();
  });

  it('should test view_trips_history case', (done) => {
    const payload = createPayload('view_upcoming_trips');

    const result = SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    done();
  });

  it('should test view_upcoming_trips case', async (done) => {
    const payload = createPayload('view_upcoming_trips');

    const result = await SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(TripItineraryHelper.handleUpcomingTrips).toHaveBeenCalled();
    done();
  });

  it('should test default case', (done) => {
    const payload = createPayload('');
    const result = SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    done();
  });
});
