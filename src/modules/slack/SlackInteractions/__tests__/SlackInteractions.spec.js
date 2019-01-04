import SlackInteractions from '../index';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import ManageTripController from '../../TripManagement/ManageTripController';
import ScheduleTripController from '../../TripManagement/ScheduleTripController';
import RescheduleTripController from '../../TripManagement/RescheduleTripController';
import CancelTripController from '../../TripManagement/CancelTripController';
import Cache from '../../../../cache';
import ScheduleTripInputHandlers from '../../../../helpers/slack/ScheduleTripInputHandlers';
import { createPayload, respondMock, responseMessage } from '../__mocks__/SlackInteractions.mock';
import SlackControllerMock from '../../__mocks__/SlackControllerMock';
import TripItineraryController from '../../TripManagement/TripItineraryController';
import TripActionsController from '../../TripManagement/TripActionsController';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import SlackEvents from '../../events';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import travelTripHelper from '../../helpers/slackHelpers/TravelTripHelper';
import TripRescheduleHelper from '../../helpers/slackHelpers/rescheduleHelper';
import RouteInputHandlers from '../../RouteManagement';

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
      state: '',
      team: { id: 'AHJKURLKJR' }
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
      state: '',
      team: { id: 'AHJKURLKJR' }
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
        state: '',
        team: { id: 'AHJKURLKJR' }
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

  it('should test back_to_launch', (done) => {
    const payload = createPayload('back_to_travel_launch');
    const result = SlackInteractions.launch(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalled();
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
    expect(Cache.save).toHaveBeenCalled();
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
    await SlackInteractions.handleUserInputs(payload, 'respond');
    expect(reasonhandler).toHaveBeenCalledWith(payload, 'respond', 'reason');
  });

  it('should respond with default message if handler does not exist in object', async () => {
    const payload = createPayload('default');
    await SlackInteractions.handleUserInputs(payload, handleRespond);
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
    TripRescheduleHelper.sendTripRescheduleDialog = jest.fn();
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
    expect(TripRescheduleHelper.sendTripRescheduleDialog).toHaveBeenCalled();
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

  it('should handle cancel trip errors', async (done) => {
    const payload = createPayload(1, 'cancel_trip');
    const errorMessage = 'Dummy error message';
    CancelTripController.cancelTrip = jest.fn(() => Promise.reject(new Error(errorMessage)));

    const result = await SlackInteractions.handleItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(itineraryRespond).toHaveBeenCalledWith(
      responseMessage(errorMessage)
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
    TeamDetailsService.getTeamDetailsBotOauthToken = jest.fn(() => {});
    const payload = {
      state: 'reschedule boy',
      submission: {
        new_month: 11,
        new_date: 22,
        new_year: 2019
      },
      user: 'user',
      team: { id: 'XXXXXXX' }
    };
    const result = await SlackInteractions.handleReschedule(payload, rescheduleRespond);
    expect(result).toEqual({ errors: expectedErrorResponse });
    done();
  });

  it('should test reschedule switch interaction', async (done) => {
    RescheduleTripController.runValidations = jest.fn(() => ([]));
    RescheduleTripController.rescheduleTrip = jest.fn(() => response);
    TeamDetailsService.getTeamDetailsBotOauthToken = jest.fn(() => { });
    const payload = {
      state: 'reschedule boy',
      submission: {
        new_month: 11,
        new_date: 22,
        new_year: 2019
      },
      user: 'user',
      team: { id: 'XXXXXXX' }
    };
    const result = await SlackInteractions.handleReschedule(payload, rescheduleRespond);
    expect(result).toEqual(undefined);
    expect(rescheduleRespond).toHaveBeenCalledWith(response);
    done();
  });

  it('should test reschedule switch interaction', async (done) => {
    RescheduleTripController.runValidations = jest.fn(() => ([]));
    RescheduleTripController.rescheduleTrip = jest.fn(() => response);
    TeamDetailsService.getTeamDetailsBotOauthToken = jest.fn(() => { });
    const payload = {
      state: 'boy',
      submission: {
        new_month: 11,
        new_date: 22,
        new_year: 2019
      },
      user: 'user',
      team: { id: 'XXXXXXX' }
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
    TripItineraryController.handleTripHistory = jest.fn();
    TripItineraryController.handleUpcomingTrips = jest.fn();
  });

  it('should test view_trips_history case', async (done) => {
    const payload = createPayload('view_trips_history');

    const result = await SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
    expect(result).toBe(undefined);
    expect(TripItineraryController.handleTripHistory).toHaveBeenCalled();
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
    await SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
    expect(TripItineraryController.handleUpcomingTrips).toHaveBeenCalled();
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
  beforeEach(() => {
    DialogPrompts.sendOperationsApprovalDialog = jest.fn();
    DialogPrompts.sendOperationsDeclineDialog = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  it('should handle confirm trip', () => {
    const payload = { actions: [{ name: 'confirmTrip' }] };
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsApprovalDialog).toBeCalledWith(payload);
  });

  it('should handle confirm trip', () => {
    const payload = { actions: [{ name: 'declineRequest' }] };
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsDeclineDialog).toBeCalledWith(payload);
  });

  it('should handle default', () => {
    const payload = { actions: [{ name: 'declineRequests' }] };
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsDeclineDialog).not.toHaveBeenCalled();
  });
});

describe('Handle trip actions', () => {
  let response;
  let payload;

  beforeEach(() => {
    payload = {
      submission:
        {
          confirmationComment: 'yes',
          driverName: 'Valid Name',
          driverPhoneNo: '1234567890',
          regNumber: 'LNS 8367*'
        }
    };
    response = jest.fn();
    DialogPrompts.sendOperationsApprovalDialog = jest.fn();
    DialogPrompts.sendOperationsDeclineDialog = jest.fn();
    TripActionsController.changeTripStatus = jest.fn(() => {});
    TripActionsController.runCabValidation = jest.fn(() => []);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should handle confirm trip', () => {
    payload.actions = [{ name: 'confirmTrip' }];
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsApprovalDialog).toBeCalledWith(payload);
  });

  it('should handle confirm trip', () => {
    payload.actions = [{ name: 'declineRequest' }];
    SlackInteractions.sendCommentDialog(payload);
    expect(DialogPrompts.sendOperationsDeclineDialog).toBeCalledWith(payload);
  });

  it('should throw an error', async () => {
    payload.actions = [{ name: 'declineRequest' }];
    const error = new Error('not working');
    TripActionsController.changeTripStatus = jest.fn(() => Promise.reject(error));
    try {
      await SlackInteractions.handleTripActions(payload, response);
    } catch (err) {
      expect(response).toHaveBeenCalled();
    }
  });

  it('should handle validation error', async () => {
    const errors = [{ message: 'dummy error message' }];
    TripActionsController.runCabValidation = jest.fn(() => ([...errors]));
    const error = await SlackInteractions.handleTripActions(payload, response);
    expect(error).toEqual({ errors });
    expect(TripActionsController.changeTripStatus).not.toHaveBeenCalled();
  });

  it('should handle confirmationComment', () => {
    SlackInteractions.handleTripActions(payload, response);
    expect(TripActionsController.changeTripStatus).toHaveBeenCalled();
  });

  it('should handle declineComment', () => {
    payload.submission = { opsDeclineComment: 'fghj' };
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
    const teamId = 190;
    const payload = {
      submission: {
        approveRequest: 'dfghj'
      },
      team: {
        id: teamId
      },
      user: {},
      state: 'cvbn jhgf ty'
    };
    const respond = jest.fn();
    SlackHelpers.approveRequest = jest.fn(() => true);
    SlackEvents.raise = jest.fn();
    SlackHelpers.getTripRequest = jest.fn();
    InteractivePrompts.sendManagerDeclineOrApprovalCompletion = jest.fn();
    const getTeamDetailsBotOauthToken = jest.spyOn(TeamDetailsService,
      'getTeamDetailsBotOauthToken')
      .mockImplementationOnce(() => Promise.resolve());

    await SlackInteractions.handleManagerApprovalDetails(payload, respond);
    expect(SlackEvents.raise).toHaveBeenCalled();
    expect(SlackHelpers.getTripRequest).toHaveBeenCalled();
    expect(InteractivePrompts.sendManagerDeclineOrApprovalCompletion).toHaveBeenCalledTimes(1);
    expect(getTeamDetailsBotOauthToken).toHaveBeenCalledTimes(1);
    expect(getTeamDetailsBotOauthToken).toHaveBeenCalledWith(teamId);
    getTeamDetailsBotOauthToken.mockRestore();
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

describe('should test book travel start', () => {
  let respond;

  beforeEach(() => {
    respond = respondMock();
    Cache.save = jest.fn(() => { });
  });

  it('should return thank you message', () => {
    const payload = createPayload('can', 'cancel');
    SlackInteractions.bookTravelTripStart(payload, respond);
    expect(respond).toHaveBeenCalledWith(
      responseMessage('Thank you for using Tembea. See you again.')
    );
  });

  it('should return thank you message', () => {
    const payload = createPayload('can', 'airport');
    const sendTripDetailsForm = jest.spyOn(DialogPrompts, 'sendTripDetailsForm');
    sendTripDetailsForm.mockImplementation((value1, value2) => ({ value1, value2 }));

    SlackInteractions.bookTravelTripStart(payload, respond);
    expect(Cache.save).toHaveBeenCalled();
    expect(sendTripDetailsForm).toHaveBeenCalledWith(payload,
      'travelTripContactDetailsForm', 'travel_trip_contactDetails');
  });
});

describe('should test handle travelTrip actions', () => {
  let respond;

  beforeEach(() => {
    respond = respondMock();
  });

  it('should call the tripHandler method based on callBackId', () => {
    const payload = createPayload('testBack', 'cancel');
    travelTripHelper.testBack = jest.fn((value1, value2) => ({ value1, value2 }));
    SlackInteractions.handleTravelTripActions(payload, respond);

    expect(travelTripHelper.testBack).toHaveBeenCalledWith(payload, respond);
  });

  it('should call the tripHandler method based on callBackId', () => {
    const payload = createPayload('test', 'cancel');
    SlackInteractions.handleTravelTripActions(payload, respond);

    expect(respond).toHaveBeenCalledWith(
      responseMessage('Thank you for using Tembea. See you again.')
    );
  });
});

describe('Slack Interactions test: Tembea Route', () => {
  let respond;

  beforeEach(() => {
    respond = respondMock();
    DialogPrompts.sendLocationForm = jest.fn();
  });
  it('should test view_available_routes action', (done) => {
    const payload = createPayload('view_available_routes');
    const result = SlackInteractions.startRouteActions(payload, respond);
    expect(result).toBe(undefined);
    expect(respond).toHaveBeenCalledWith(responseMessage('Coming soon...'));
    done();
  });

  it('should test request_new_route action', (done) => {
    const payload = createPayload('request_new_route');
    const result = SlackInteractions.startRouteActions(payload, respond);
    expect(result).toBe(undefined);
    expect(DialogPrompts.sendLocationForm).toHaveBeenCalledWith(payload);
    done();
  });
  it('should call the tripHandler method based on callBackId', () => {
    const payload = createPayload('test', 'cancel');
    SlackInteractions.startRouteActions(payload, respond);

    expect(respond).toHaveBeenCalledWith(
      responseMessage('Thank you for using Tembea. See you again.')
    );
  });
  it('should call handleRouteActions based on the callBackId', () => {
    const payload = createPayload('testBack', 'cancel');
    RouteInputHandlers.testBack = jest.fn((value1, value2) => ({ value1, value2 }));
    SlackInteractions.handleRouteActions(payload, respond);

    expect(RouteInputHandlers.testBack).toHaveBeenCalledWith(payload, respond);
  });
  it('should call handleRouteActions based on the callBackId', () => {
    const payload = createPayload('test', 'cancel');
    SlackInteractions.handleRouteActions(payload, respond);

    expect(respond).toHaveBeenCalledWith(
      responseMessage('Thank you for using Tembea. See you again.')
    );
  });
});
