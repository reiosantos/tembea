import SlackInteractions from '../index';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import ManageTripController from '../../TripManagement/ManageTripController';
import ScheduleTripController from '../../TripManagement/ScheduleTripController';
import RescheduleTripController from '../../TripManagement/RescheduleTripController';
import CancelTripController from '../../TripManagement/CancelTripController';
import Cache from '../../../../cache';
import ScheduleTripInputHandlers from '../../../../helpers/slack/ScheduleTripInputHandlers';
import { responseMessage, createPayload, respondMock } from '../__mocks__/SlackInteractions.mock';
import SlackControllerMock from '../../__mocks__/SlackControllerMock';
import TripItineraryHelper from '../../helpers/slackHelpers/TripItineraryHelper';
import TripActionsController from '../../TripManagement/TripActionsController';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import SlackEvents from '../../events';

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
        as_user: false,
        user: undefined,
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
      }, (res) => {
        expect(res).toEqual({
          as_user: false,
          user: undefined,
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
    Cache.save = jest.fn(() => {});
    DialogPrompts.sendTripReasonForm = jest.fn(value1 => ({ value1 }));
    DialogPrompts.sendTripDetailsForm = jest.fn((value1, value2) => ({ value1, value2 }));
  });

  it('should test book new trip action', (done) => {
    const payload = createPayload('true');
    const result = SlackInteractions.bookNewTrip(payload, respond);
    expect(result).toBe(undefined);
    expect(DialogPrompts.sendTripReasonForm).toHaveBeenCalledWith(payload);
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

  beforeEach(() => {
    ScheduleTripController.createRequest = jest.fn(() => 1);
    handleRespond = respondMock();
  });

  it('should call scheduleTripHandler if handler exists in object', async () => {
    const reasonhandler = jest
      .spyOn(ScheduleTripInputHandlers, 'reason')
      .mockImplementation(() => {});
    const payload = createPayload('reason');
    SlackInteractions.handleUserInputs(payload, 'respond');
    expect(reasonhandler).toHaveBeenCalledWith(payload, 'respond', 'reason');
  });

  it('should respond with default message if handler does not exist in object', async () => {
    const payload = createPayload('default');
    SlackInteractions.handleUserInputs(payload, handleRespond);
    expect(handleRespond).toHaveBeenCalledWith(
      responseMessage('Thank you for using Tembea. See you again.')
    );
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

  it('should trigger trip', async (done) => {
    const payload = createPayload(1, 'trip');
    CancelTripController.cancelTrip = jest.fn(() => Promise.resolve('message'));

    const result = await SlackInteractions.handleItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(itineraryRespond).toHaveBeenCalledWith(
      responseMessage('Thank you for using Tembea. See you again.')
    );
    done();
  });

  it('should handle cancel trip errors', async () => {
    const payload = createPayload(1, 'cancel_trip');
    const errorMessage = 'Dummy error message';
    CancelTripController.cancelTrip = jest.fn(() => Promise.reject(new Error(errorMessage)));

    const result = await SlackInteractions.handleItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(itineraryRespond).toHaveBeenCalledWith(
      responseMessage(errorMessage)
    );
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

describe('Send comment dialog', () => {
  it('should handle confirm trip', () => {
    DialogPrompts.sendOperationsApprovalDialog = jest.fn();
    const payload = { actions: [{ name: 'confirmTrip' }] };
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsApprovalDialog).toBeCalledWith(payload);
  });

  it('should handle confirm trip', () => {
    DialogPrompts.sendOperationsDeclineDialog = jest.fn();
    const payload = { actions: [{ name: 'declineRequest' }] };
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsDeclineDialog).toBeCalledWith(payload);
  });

  it('should handle default', () => {
    DialogPrompts.sendOperationsDeclineDialog = jest.fn();
    const payload = { actions: [{ name: 'declineRequests' }] };
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsDeclineDialog).not.toHaveBeenCalled();
  });
});

describe('Handle trip actions', () => {
  it('should handle confirm trip', () => {
    DialogPrompts.sendOperationsApprovalDialog = jest.fn();
    const payload = { actions: [{ name: 'confirmTrip' }] };
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsApprovalDialog).toBeCalledWith(payload);
  });

  it('should handle confirm trip', () => {
    DialogPrompts.sendOperationsDeclineDialog = jest.fn();
    const payload = { actions: [{ name: 'declineRequest' }] };
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsDeclineDialog).toBeCalledWith(payload);
  });

  it('should throw an error', () => {
    const response = jest.fn();

    const payload = { actions: [{ name: 'declineRequest' }] };
    SlackInteractions.handleTripActions(payload, response);
    expect(response).toHaveBeenCalled();
  });

  it('should handle confirmationComment', () => {
    TripActionsController.changeTripStatus = jest.fn(() => {});
    const response = jest.fn();

    const payload = { submission: { confirmationComment: 'fghj' }, actions: [{ name: 'declineRequest' }] };
    SlackInteractions.handleTripActions(payload, response);
    expect(TripActionsController.changeTripStatus).toHaveBeenCalled();
  });

  it('should handle confirmationComment', () => {
    TripActionsController.changeTripStatus = jest.fn(() => {});
    const response = jest.fn();

    const payload = { submission: { comment: 'fghj' }, actions: [{ name: 'declineRequest' }] };
    SlackInteractions.handleTripActions(payload, response);
    expect(TripActionsController.changeTripStatus).toHaveBeenCalled();
  });
});

describe('Manager Approve trip', () => {
  it('manager should be able to approve trip', () => {
    const trip = {
      isApproved: true
    };
    const respond = jest.fn();
    SlackInteractions.approveTripRequestByManager({}, trip, respond);

    expect(respond).toHaveBeenCalled();
  });

  it('should handle has approved', async () => {
    const payload = {
      submission: {
        approveRequest: 'dfghj'
      },
      user: {},
      state: 'cvbn jhgf ty'
    };
    const respond = jest.fn();
    SlackHelpers.approveRequest = jest.fn(() => true);
    SlackEvents.raise = jest.fn();
    SlackHelpers.getTripRequest = jest.fn();
    InteractivePrompts.sendManagerDeclineOrApprovalCompletion = jest.fn();

    await SlackInteractions.handleManagerApprovalDetails(payload, respond);
    expect(SlackEvents.raise).toHaveBeenCalled();
    expect(SlackHelpers.getTripRequest).toHaveBeenCalled();
  });

  it('should respond with error', async () => {
    const payload = {
      submission: {
        approveRequest: 'dfghj'
      },
      user: {},
      state: 'cvbn jhgf ty'
    };
    const respond = jest.fn();
    SlackHelpers.approveRequest = jest.fn(() => false);

    await SlackInteractions.handleManagerApprovalDetails(payload, respond);
    expect(respond).toHaveBeenCalled();
  });
});
