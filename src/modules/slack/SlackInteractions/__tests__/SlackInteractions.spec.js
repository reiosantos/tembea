import SlackInteractions from '../index';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import ManageTripController from '../../TripManagement/ManageTripController';
import RescheduleTripController from '../../TripManagement/RescheduleTripController';
import CancelTripController from '../../TripManagement/CancelTripController';
import Cache from '../../../../cache';
import {
  createPayload, respondMock, responseMessage, createTripActionWithOptionsMock
} from '../__mocks__/SlackInteractions.mock';
import TripItineraryController from '../../TripManagement/TripItineraryController';
import TripActionsController from '../../TripManagement/TripActionsController';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import SlackEvents from '../../events';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import TravelTripHelper from '../../helpers/slackHelpers/TravelTripHelper';
import TripRescheduleHelper from '../../helpers/slackHelpers/rescheduleHelper';
import RouteInputHandlers from '../../RouteManagement';
import BugsnagHelper from '../../../../helpers/bugsnagHelper';
import SlackController from '../../SlackController';
import ManagerActionsHelper from '../../helpers/slackHelpers/ManagerActionsHelper';
import ViewTripHelper from '../../helpers/slackHelpers/ViewTripHelper';
import JoinRouteInteractions from '../../RouteManagement/JoinRoute/JoinRouteInteractions';
import tripService from '../../../../services/TripService';
import OpsTripActions from '../../TripManagement/OpsTripActions';
import ProvidersController from '../../RouteManagement/ProvidersController';
import SlackInteractionsHelpers from '../../helpers/slackHelpers/SlackInteractionsHelpers';
import InteractivePromptSlackHelper from '../../helpers/slackHelpers/InteractivePromptSlackHelper';
import ProviderService from '../../../../services/ProviderService';
import SlackNotifications from '../../SlackPrompts/Notifications';
import OpsDialogPrompts from '../../SlackPrompts/OpsDialogPrompts';
import HomebaseService from '../../../../services/HomebaseService';


describe('SlackInteractions', () => {
  let payload1;
  let respond1;
  beforeAll(() => {
    respond1 = jest.fn();
    payload1 = {
      actions: [{
        value: 'tests'
      }],
      channel: { id: 2 },
      original_message: { ts: 'dsfdf' },
      user: { id: 3 }
    };

    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('xyz');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('Handle manager actions', () => {
    it('should handle manager actions when isCancel is true', async () => {
      jest.spyOn(SlackHelpers, 'handleCancellation').mockResolvedValue(true);
      await SlackInteractions.handleManagerActions(payload1, respond1);
      expect(respond1.mock.calls[0][0].text)
        .toEqual('The trip request has already been cancelled.');
    });

    it('should handle manager approve', async () => {
      payload1.actions[0].name = 'managerApprove';
      jest.spyOn(SlackHelpers, 'handleCancellation').mockResolvedValue(false);
      jest.spyOn(ManagerActionsHelper, 'managerApprove').mockResolvedValue({});
      await SlackInteractions.handleManagerActions(payload1, respond1);

      expect(ManagerActionsHelper.managerApprove).toHaveBeenCalled();
    });

    it('should handle manager decline', async () => {
      payload1.actions[0].name = 'managerDecline';
      jest.spyOn(SlackHelpers, 'handleCancellation').mockResolvedValue(false);
      jest.spyOn(ManagerActionsHelper, 'managerDecline').mockResolvedValue({});
      await SlackInteractions.handleManagerActions(payload1, respond1);

      expect(ManagerActionsHelper.managerDecline).toHaveBeenCalled();
    });

    it('should catch thrown errors', async () => {
      payload1.actions[0].name = null;
      jest.spyOn(SlackHelpers, 'handleCancellation').mockResolvedValue(false);
      jest.spyOn(ManagerActionsHelper, 'managerApprove').mockImplementation();
      jest.spyOn(BugsnagHelper, 'log').mockReturnValue({});
      await SlackInteractions.handleManagerActions(payload1, respond1);

      expect(BugsnagHelper.log).toHaveBeenCalled();
      expect(respond1).toHaveBeenCalled();
    });
  });

  describe('Manager decline trip', () => {
    beforeAll(() => {
      ManageTripController.declineTrip = jest.fn(() => { });
      jest.spyOn(ManageTripController, 'declineTrip').mockImplementation(() => { });
    });

    it('should handle empty decline message', async () => {
      const res = await SlackInteractions.handleTripDecline({
        submission: {
          declineReason: '        '
        },
        state: '',
        team: { id: 'AHJKURLKJR' }
      });

      expect(res.errors.length).toBe(1);
      expect(res.errors[0]).toEqual({ name: 'declineReason', error: 'This field cannot be empty' });
    });

    it('should handle trip decline', async () => {
      await SlackInteractions.handleTripDecline({
        submission: {
          declineReason: 'Just a funny reason'
        },
        state: '',
        team: { id: 'AHJKURLKJR' }
      });

      expect(ManageTripController.declineTrip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling for manager decline', () => {
    it('should catch unexpected errors', async () => {
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
      SlackController.getWelcomeMessage = jest.fn().mockReturnValue({});
      SlackInteractions.launch(payload, respond);
      expect(SlackController.getWelcomeMessage).toHaveBeenCalled();
      done();
    });

    it('should test leave_route', (done) => {
      const payload = createPayload('leave_route');
      SlackController.leaveRoute = jest.fn().mockReturnValue({});
      SlackInteractions.launch(payload, respond);
      expect(SlackController.leaveRoute).toHaveBeenCalled();
      done();
    });

    it('should test back_to_launch', (done) => {
      const payload = createPayload('back_to_travel_launch');
      SlackController.getTravelCommandMsg = jest.fn().mockReturnValue({});
      SlackInteractions.launch(payload, respond);
      expect(SlackController.getTravelCommandMsg).toHaveBeenCalled();
      done();
    });

    it('should test back_to_routes_launch', (done) => {
      const payload = createPayload('back_to_routes_launch');
      SlackController.getRouteCommandMsg = jest.fn().mockReturnValue({});
      SlackInteractions.launch(payload, respond);
      expect(SlackController.getRouteCommandMsg).toHaveBeenCalled();
      done();
    });

    it('should test launch default response', async () => {
      const payload = createPayload();
      const result = await SlackInteractions.launch(payload, respond);
      expect(result).toBe(undefined);
      expect(respond).toHaveBeenCalledWith(responseMessage());
    });

    it('should test book_new_trip action', async () => {
      const payload = createPayload('book_new_trip');
      const result = await SlackInteractionsHelpers.welcomeMessage(payload, respond);
      expect(result).toBe(undefined);
      expect(respond).toBeCalled();
    });

    it('should test view_trips_itinerary action', async () => {
      const payload = createPayload('view_trips_itinerary');
      const result = await SlackInteractionsHelpers.welcomeMessage(payload, respond);
      expect(result).toBe(undefined);
      expect(respond).toBeCalled();
    });

    it('should test Welcome message default action', async () => {
      const payload = createPayload();
      const result = await SlackInteractionsHelpers.welcomeMessage(payload, respond);
      expect(result).toBe(undefined);
      expect(respond).toHaveBeenCalledWith(responseMessage());
    });
  });

  describe('Slack Interactions test: book new Trip switch', () => {
    let respond;

    beforeEach(() => {
      respond = respondMock();
      Cache.save = jest.fn(() => { });
      DialogPrompts.sendTripReasonForm = jest.fn(value1 => ({ value1 }));
      DialogPrompts.sendTripDetailsForm = jest.fn((value1, value2) => ({ value1, value2 }));
    });

    it('should test book new trip action', async () => {
      const payload = createPayload('true');
      const result = await SlackInteractionsHelpers.bookNewTrip(payload, respond);
      expect(result).toBe(undefined);
      expect(Cache.save).toHaveBeenCalled();
      expect(DialogPrompts.sendTripReasonForm).toHaveBeenCalledWith(payload);
    });

    it('should test book new trip default action', async () => {
      const payload = createPayload();
      const result = await SlackInteractionsHelpers.bookNewTrip(payload, respond);
      expect(result).toBe(undefined);
      expect(respond).toHaveBeenCalledWith(
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

    it('should trigger dispalyTripRequestInteractive prompt', async () => {
      const payload = createPayload('value', 'view');
      jest.spyOn(ViewTripHelper, 'displayTripRequest').mockResolvedValue();

      await SlackInteractionsHelpers.handleItineraryActions(payload, itineraryRespond);
      expect(ViewTripHelper.displayTripRequest).toHaveBeenCalled();
    });

    it('should trigger reschedule dialog', async () => {
      const payload = createPayload('value', 'reschedule');

      const result = await SlackInteractionsHelpers.handleItineraryActions(payload, itineraryRespond);
      expect(result).toBe(undefined);
      expect(TripRescheduleHelper.sendTripRescheduleDialog).toHaveBeenCalled();
    });

    it('should trigger cancel trip', async () => {
      const payload = createPayload(1, 'cancel_trip');
      CancelTripController.cancelTrip = jest.fn(() => Promise.resolve('message'));

      const result = await SlackInteractionsHelpers.handleItineraryActions(payload, itineraryRespond);
      expect(result).toBe(undefined);
      expect(itineraryRespond).toHaveBeenCalledWith(
        'message'
      );
    });

    it('should trigger trip', async () => {
      const payload = createPayload(1, 'trip');
      CancelTripController.cancelTrip = jest.fn(() => Promise.resolve('message'));

      const result = await SlackInteractionsHelpers.handleItineraryActions(payload, itineraryRespond);
      expect(result).toBe(undefined);
      expect(itineraryRespond).toHaveBeenCalledWith(
        responseMessage('Thank you for using Tembea. See you again.')
      );
    });
  });

  describe('test handle reschedule function', () => {
    let rescheduleRespond;
    const expectedErrorResponse = [{ error: 'error1' }];
    const response = 'request submitted';

    beforeEach(() => {
      rescheduleRespond = respondMock();
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('xyz');
    });

    it('should test reschedule switch interaction', async () => {
      RescheduleTripController.runValidations = jest.fn(() => (expectedErrorResponse));
      RescheduleTripController.rescheduleTrip = jest.fn(() => response);
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
      const result = await SlackInteractionsHelpers.handleReschedule(payload, rescheduleRespond);
      expect(result).toEqual({ errors: expectedErrorResponse });
    });

    it('should test reschedule switch interaction', async () => {
      RescheduleTripController.runValidations = jest.fn(() => ([]));
      RescheduleTripController.rescheduleTrip = jest.fn(() => response);
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
      const result = await SlackInteractionsHelpers.handleReschedule(payload, rescheduleRespond);
      expect(result).toEqual(undefined);
      expect(rescheduleRespond).toHaveBeenCalledWith(response);
    });

    it('should test reschedule switch interaction', async () => {
      RescheduleTripController.runValidations = jest.fn(() => ([]));
      RescheduleTripController.rescheduleTrip = jest.fn(() => response);
      // TeamDetailsService.getTeamDetailsBotOauthToken = jest.fn(() => { });
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
      const result = await SlackInteractionsHelpers.handleReschedule(payload, rescheduleRespond);
      expect(result).toEqual(undefined);
      expect(rescheduleRespond).toHaveBeenCalledWith('request submitted');
    });
  });

  describe('test viewTripItineraryActions switch', () => {
    let itineraryRespond;

    beforeEach(() => {
      itineraryRespond = respondMock();
      TripItineraryController.handleTripHistory = jest.fn();
      TripItineraryController.handleUpcomingTrips = jest.fn();
    });

    it('should test view_trips_history case', async () => {
      const payload = createPayload('view_trips_history');

      const result = await SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
      expect(result).toBe(undefined);
      expect(TripItineraryController.handleTripHistory).toHaveBeenCalled();
    });

    it('should test view_trips_history case', (done) => {
      const payload = createPayload('view_upcoming_trips');

      const result = SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
      expect(result).toBe(undefined);
      done();
    });

    it('should test view_upcoming_trips case', async () => {
      const payload = createPayload('view_upcoming_trips');
      await SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
      expect(TripItineraryController.handleUpcomingTrips).toHaveBeenCalled();
    });

    it('should test default case', (done) => {
      const payload = createPayload('');
      const result = SlackInteractions.viewTripItineraryActions(payload, itineraryRespond);
      expect(result).toBe(undefined);
      done();
    });
  });

  describe('Send comment dialog', () => {
    let respond;
    beforeEach(() => {
      DialogPrompts.sendOperationsApprovalDialog = jest.fn();
      DialogPrompts.sendOperationsDeclineDialog = jest.fn();
      respond = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
    it('should handle confirm trip', () => {
      const payload = { actions: [{ name: 'confirmTrip' }] };
      SlackInteractionsHelpers.sendCommentDialog(payload, respond);
      expect(DialogPrompts.sendOperationsApprovalDialog).toBeCalledWith(payload, respond);
    });

    it('should handle confirm trip', () => {
      const payload = { actions: [{ name: 'declineRequest' }] };
      SlackInteractionsHelpers.sendCommentDialog(payload);
      expect(DialogPrompts.sendOperationsDeclineDialog).toBeCalledWith(payload);
    });

    it('should handle default', () => {
      const payload = { actions: [{ name: 'declineRequests' }] };
      SlackInteractionsHelpers.sendCommentDialog(payload);
      expect(DialogPrompts.sendOperationsDeclineDialog).not.toHaveBeenCalled();
    });
  });

  describe('Handle trip actions', () => {
    let response;
    let payload;
    let respond;

    beforeEach(() => {
      payload = {
        callback_id: 'operations_reason_dialog_trips',
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
      TripActionsController.changeTripStatus = jest.fn(() => { });
      TripActionsController.runCabValidation = jest.fn(() => []);
      respond = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should handle confirm trip', () => {
      payload.actions = [{ name: 'confirmTrip' }];
      SlackInteractionsHelpers.sendCommentDialog(payload, respond);
      expect(DialogPrompts.sendOperationsApprovalDialog).toBeCalledWith(payload, respond);
    });

    it('should handle confirm trip', () => {
      payload.actions = [{ name: 'declineRequest' }];
      SlackInteractionsHelpers.sendCommentDialog(payload);
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
    it('approveTripRequestByManager:  trip already approved', () => {
      const trip = {
        isApproved: true
      };
      const respond = jest.fn();
      SlackInteractionsHelpers.approveTripRequestByManager({}, trip, respond);

      expect(respond).toHaveBeenCalled();
    });

    it('approveTripRequestByManager: trip not yet approved', () => {
      const trip = { isApproved: false };
      const payload = {
        original_message: { ts: '123.123456' },
        channel: { id: '1' },
        actions: [{ value: 'value' }]
      };
      DialogPrompts.sendReasonDialog = jest.fn();
      SlackInteractionsHelpers.approveTripRequestByManager(payload, trip);
      expect(DialogPrompts.sendReasonDialog).toBeCalled();
    });

    it('should handle has approved', async () => {
      const teamId = 190;
      const payload = {
        submission: {
          approveReason: 'dfghj'
        },
        team: {
          id: teamId
        },
        user: {},
        state: 'cvbn jhgf ty'
      };
      const respond = jest.fn();
      jest.spyOn(SlackHelpers, 'approveRequest').mockResolvedValue(true);
      jest.spyOn(SlackEvents, 'raise').mockReturnValue();
      jest.spyOn(InteractivePrompts, 'sendManagerDeclineOrApprovalCompletion')
        .mockResolvedValue();
      jest.spyOn(tripService, 'getById')
        .mockImplementation(id => Promise.resolve({ id, name: 'Test Trip' }));
      const getTeamDetailsBotOauthToken = jest.spyOn(
        TeamDetailsService, 'getTeamDetailsBotOauthToken'
      ).mockResolvedValue('xyz');
      await SlackInteractions.handleManagerApprovalDetails(payload, respond);
      expect(SlackEvents.raise).toHaveBeenCalled();
      expect(tripService.getById).toHaveBeenCalled();
      expect(InteractivePrompts.sendManagerDeclineOrApprovalCompletion).toHaveBeenCalledTimes(1);
      expect(getTeamDetailsBotOauthToken).toHaveBeenCalledTimes(1);
      expect(getTeamDetailsBotOauthToken).toHaveBeenCalledWith(teamId);
    });

    it('should respond with error', async () => {
      const payload = {
        submission: {
          approveReason: 'dfghj'
        },
        user: {},
        state: 'cvbn jhgf ty',
        team: { id: 'abcde' }
      };
      const respond = jest.fn();
      SlackHelpers.approveRequest = jest.fn(() => false);

      await SlackInteractions.handleManagerApprovalDetails(payload, respond);
      expect(respond).toHaveBeenCalled();
    });
    it('should return errors if approveReason is empty', async () => {
      const payload = {
        submission: { approveReason: '    ' },
        state: 'yes no maybe',
        team: { id: 'abcde' }
      };
      const respond = jest.fn();

      const result = await SlackInteractions.handleManagerApprovalDetails(payload, respond);

      expect(result).toEqual({
        errors:
          [{ error: 'This field cannot be empty', name: 'approveReason' }]
      });
    });
  });

  describe('should test book travel start', () => {
    let respond;

    beforeEach(() => {
      respond = respondMock();
      Cache.save = jest.fn(() => { });
    });

    it('should return thank you message', async () => {
      const payload = createPayload('can', 'cancel');
      await SlackInteractions.bookTravelTripStart(payload, respond);
      expect(respond).toHaveBeenCalledWith(
        responseMessage('Thank you for using Tembea. See you again.')
      );
    });

    it('should return thank you message', async () => {
      const payload = createPayload('can', 'airport');
      const sendTripDetailsForm = jest.spyOn(DialogPrompts, 'sendTripDetailsForm');
      sendTripDetailsForm.mockImplementation((value1, value2) => ({ value1, value2 }));

      await SlackInteractions.bookTravelTripStart(payload, respond);
      expect(Cache.save).toHaveBeenCalled();
      expect(sendTripDetailsForm).toHaveBeenCalledWith(payload,
        'travelTripContactDetailsForm', 'travel_trip_contactDetails');
    });

    it('should handle changeLocation via travel command', async () => {
      const payload = createPayload('change_location', 'changeLocation__travel');
      jest.spyOn(InteractivePrompts, 'changeLocation');
      await SlackInteractions.bookTravelTripStart(payload, respond);
      expect(InteractivePrompts.changeLocation).toHaveBeenCalled();
    });
  });

  describe('should test handle travelTrip actions', () => {
    let respond;

    beforeEach(() => {
      respond = respondMock();
    });

    it('should call the tripHandler method based on callBackId', () => {
      const payload = createPayload('testBack', 'cancel');
      TravelTripHelper.testBack = jest.fn((value1, value2) => ({ value1, value2 }));
      SlackInteractions.handleTravelTripActions(payload, respond);

      expect(TravelTripHelper.testBack).toHaveBeenCalledWith(payload, respond);
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
      jest.spyOn(JoinRouteInteractions, 'handleViewAvailableRoutes').mockResolvedValue();
      jest.spyOn(JoinRouteInteractions, 'sendCurrentRouteMessage').mockResolvedValue();
    });


    it('should test my_current_route action', (done) => {
      const payload = createPayload('my_current_route');
      SlackInteractions.startRouteActions(payload, respond);
      expect(JoinRouteInteractions.sendCurrentRouteMessage).toBeCalled();
      done();
    });

    it('should test view_available_routes action', (done) => {
      const payload = createPayload('view_available_routes');
      SlackInteractions.startRouteActions(payload, respond);
      expect(JoinRouteInteractions.handleViewAvailableRoutes).toBeCalled();
      done();
    });

    it('should test change location action', async () => {
      jest.spyOn(InteractivePrompts, 'changeLocation').mockResolvedValue();
      const payload = createPayload('change_location');
      await SlackInteractions.startRouteActions(payload, respond);
      expect(InteractivePrompts.changeLocation).toBeCalled();
    });

    it('should test request_new_route action', (done) => {
      const payload = createPayload('request_new_route');
      SlackInteractions.startRouteActions(payload, respond);
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
    it('should return validation errors if they exist', () => {
      const payload = { callback_id: 'new_route_runValidations' };
      jest.spyOn(RouteInputHandlers, 'runValidations')
        .mockImplementationOnce().mockReturnValueOnce(['error']);
      const result = SlackInteractions.handleRouteActions(payload, respond);
      expect(result).toHaveProperty('errors');
    });
    it('should run bugsnag when errors are thrown', () => {
      // No values in payload will throw an error
      const payload = {};
      BugsnagHelper.log = jest.fn().mockReturnValue({});
      SlackInteractions.handleRouteActions(payload, respond);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });

    describe('completeTripResponse', () => {
      it('should call sendCompletion interactive messages', () => {
        const message = jest.spyOn(InteractivePromptSlackHelper, 'sendCompletionResponse').mockReturnValue();
        SlackInteractions.completeTripResponse(payload1, respond1);
        expect(message).toHaveBeenCalled();
      });

      it('should handle errors', () => {
        jest.spyOn(BugsnagHelper, 'log');
        jest.spyOn(InteractivePromptSlackHelper, 'sendCompletionResponse').mockImplementation(() => {
          throw new Error('error');
        });
        SlackInteractions.completeTripResponse(payload1, respond1);
        expect(BugsnagHelper.log).toHaveBeenCalled();
        expect(respond1.mock.calls[0][0].text).toEqual('Error:bangbang: : '
          + 'We could not complete this process please try again.');
      });
    });
    describe('SlackInteractions > handleSelectProviderAction', () => {
      it('should call selectProviderDialog with payload data for confirmTrip actions', async () => {
        const data = {
          actions: [
            {
              name: 'confirmTrip'
            }
          ],
          channel: { id: 'ABC' },
          team: { id: 'XYZ' }
        };
        const sendSelectProviderDialogSpy = jest.spyOn(DialogPrompts, 'sendSelectProviderDialog')
          .mockResolvedValue();
        jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
        await SlackInteractions.handleSelectProviderAction(data);
        expect(sendSelectProviderDialogSpy).toHaveBeenCalled();
      });
      it('should call identify difference between trip and route request and call trip controller', () => {
        const data = {
          callback_id: 'providers_approval_trip'
        };
        const TripCabControllerSpy = jest.spyOn(TripActionsController, 'completeTripRequest').mockResolvedValue({});

        SlackInteractions.handleSelectCabAndDriverAction(data, respond);
        expect(TripCabControllerSpy).toHaveBeenCalled();
      });
      it('should call identify difference between trip and route request and call provider controller', () => {
        const ProvidersControllerSpy = jest.spyOn(ProvidersController, 'handleProviderRouteApproval').mockResolvedValue({});
        const data = {
          callback_id: 'providers_approval_route'
        };
        SlackInteractions.handleSelectCabAndDriverAction(data, respond);
        expect(ProvidersControllerSpy).toHaveBeenCalled();
      });
      it('should handle provider actions', async () => {
        jest.spyOn(DialogPrompts, 'sendSelectCabDialog').mockResolvedValue();
        const payload = createPayload('accept_route_request');
        await SlackInteractionsHelpers.startProviderActions(payload, respond);
        expect(DialogPrompts.sendSelectCabDialog).toBeCalled();
      });
      it('should handle provider actions', (done) => {
        const payload = createPayload('default');
        SlackInteractionsHelpers.startProviderActions(payload, respond);
        expect(respond).toHaveBeenCalledWith(
          responseMessage('Thank you for using Tembea. See you again.')
        );
        done();
      });

      it('should handle decline request action', () => {
        const data = {
          actions: [
            {
              name: 'declineRequest'
            }
          ]
        };
        const sendOperationsDeclineDialogSpy = jest.spyOn(DialogPrompts, 'sendOperationsDeclineDialog').mockResolvedValue({});
        SlackInteractions.handleSelectProviderAction(data, respond);
        expect(sendOperationsDeclineDialogSpy).toHaveBeenCalled();
      });
      it('should handle select cab dialog submission', async () => {
        const data = { actions: [{ name: 'confirmTrip' }] };
        const providerDialogSubmissionSpy = jest.spyOn(DialogPrompts, 'sendSelectProviderDialog').mockResolvedValue({});
        await SlackInteractions.handleSelectProviderAction(data, respond);
        expect(providerDialogSubmissionSpy).toHaveBeenCalled();
      });
    });
    describe('SlackInteractions > handleOpsAction', () => {
      beforeEach(() => {
        jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('xyz');
      });
      it('Should call user cancellation function if trip has been canceled', async () => {
        jest.spyOn(tripService, 'getById').mockResolvedValue({ tripStatus: 'Cancelled' });
        const tripDataMock = createTripActionWithOptionsMock('assignProvider_1');

        const sendUserCancellationSpy = jest.spyOn(
          OpsTripActions, 'sendUserCancellation'
        ).mockResolvedValue({});
        await SlackInteractionsHelpers.handleOpsAction(tripDataMock, respond);
        expect(sendUserCancellationSpy).toHaveBeenCalled();
      });
      it('Should call select trip action when trip is not cancelled', async () => {
        jest.spyOn(tripService, 'getById').mockResolvedValue({ tripStatus: 'Pending' });
        jest.spyOn(DialogPrompts, 'sendSelectProviderDialog').mockResolvedValue({});
        const tripDataMock = createTripActionWithOptionsMock('assignProvider_1');

        const handleSelectProviderAction = jest.spyOn(SlackInteractions, 'handleSelectProviderAction');
        await SlackInteractionsHelpers.handleOpsAction(tripDataMock, respond);
        expect(handleSelectProviderAction).toHaveBeenCalled();
      });

      it('Should call selectDriverAndCab when assign cab option is selected', async () => {
        jest.spyOn(tripService, 'getById').mockResolvedValue({ tripStatus: 'Pending' });
        jest.spyOn(DialogPrompts, 'sendSelectProviderDialog').mockResolvedValue({});
        const tripDataMock = createTripActionWithOptionsMock('assignCab_1');

        const selectDriverAndCab = jest.spyOn(OpsDialogPrompts, 'selectDriverAndCab').mockResolvedValue();
        await SlackInteractionsHelpers.handleOpsAction(tripDataMock, respond);
        expect(selectDriverAndCab).toHaveBeenCalled();
      });
    });
  });

  describe('handleSelectCabActions', () => {
    it('Should call user cancellation function if trip has been canceled', async () => {
      jest.spyOn(ProviderService, 'getProviderBySlackId').mockResolvedValue({ id: 1 });
      jest.spyOn(tripService, 'getById').mockResolvedValue({ providerId: '16' });

      const payload = { user: { id: 1 }, actions: [{ value: 1 }], channel: { id: 1 } };
      const respond = jest.fn();
      await SlackInteractions.handleSelectCabActions(payload, respond);
      expect(ProviderService.getProviderBySlackId).toHaveBeenCalled();
    });
    it('Should return select cab dialog', async () => {
      jest.spyOn(ProviderService, 'getProviderBySlackId').mockResolvedValue({ id: '16' });
      jest.spyOn(tripService, 'getById').mockResolvedValue({ providerId: '16' });
      jest.spyOn(DialogPrompts, 'sendSelectCabDialog').mockImplementation();

      const payload = { user: { id: 1 }, actions: [{ value: 1 }], channel: { id: 1 } };
      const respond = jest.fn();
      await SlackInteractions.handleSelectCabActions(payload, respond);
      expect(ProviderService.getProviderBySlackId).toHaveBeenCalled();
      expect(DialogPrompts.sendSelectCabDialog).toBeCalled();
    });
  });
  describe('handleProviderApproval', () => {
    it('Should send select cab dialogue', async () => {
      const payload = { user: { id: 1 }, actions: [{ value: 1 }], channel: { id: 1 } };
      jest.spyOn(DialogPrompts, 'sendSelectCabDialog').mockResolvedValue();

      await SlackInteractions.handleProviderApproval(payload);
      expect(DialogPrompts.sendSelectCabDialog).toBeCalled();
    });
  });
});

describe('slackController - Homebases', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it('should handle get homebase message', async () => {
    jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockResolvedValue(
      { id: 1, name: 'Nairobi', country: { name: 'Kenya' } }
    );
    const flag = SlackHelpers.getLocationCountryFlag('Kenya');
    const homebaseMessage = await SlackController.getHomeBaseMessage(1);
    expect(homebaseMessage).toContain(`_Your current home base is ${flag} *Nairobi*_`);
  });
  it('should ask user to set their homebase', async () => {
    jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockResolvedValue();
    const homebaseMessage = await SlackController.getHomeBaseMessage(1);
    expect(homebaseMessage).toContain('`Please set your location to continue`');
  });
  it('should create a change location button', async () => {
    const changeLocationBtn = await SlackController.createChangeLocationBtn('routes');
    expect(changeLocationBtn).toEqual({
      name: 'changeLocation__routes',
      style: 'primary',
      text: 'Change Location',
      type: 'button',
      value: 'change_location'
    });
  });
});
