import SlackHelpers from '../../../helpers/slack/slackHelpers';
import { slackEventNames } from '../events/slackEvents';
import SlackEvents from '../events';
import SlackController from '../SlackController';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import RescheduleTripController from '../TripManagement/RescheduleTripController';
import CancelTripController from '../TripManagement/CancelTripController';
import TripItineraryController from '../TripManagement/TripItineraryController';
import ManageTripController from '../TripManagement/ManageTripController';
import TripActionsController from '../TripManagement/TripActionsController';
import TripRescheduleHelper from '../helpers/slackHelpers/rescheduleHelper';
import Cache from '../../../cache';
import ScheduleTripInputHandlers from '../../../helpers/slack/ScheduleTripInputHandlers';
import TeamDetailsService from '../../../services/TeamDetailsService';
import travelTripHelper from '../helpers/slackHelpers/TravelTripHelper';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import RouteInputHandlers from '../RouteManagement';
import ManagerActionsHelper from '../helpers/slackHelpers/ManagerActionsHelper';
import ViewTripHelper from '../helpers/slackHelpers/ViewTripHelper';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import handleActions from './SlackInteractionsHelper';
import JoinRouteInteractions from '../RouteManagement/JoinRoute/JoinRouteInteractions';
import tripService from '../../../services/TripService';
import CleanData from '../../../helpers/cleanData';

class SlackInteractions {
  static launch(data, respond) {
    const payload = CleanData.trim(data);
    const action = payload.actions[0].value;
    switch (action) {
      case 'back_to_launch':
        respond(SlackController.getWelcomeMessage());
        break;
      case 'back_to_travel_launch':
        respond(SlackController.getTravelCommandMsg());
        break;
      case 'back_to_routes_launch':
        respond(SlackController.getRouteCommandMsg());
        break;
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea'));
        break;
    }
  }

  static welcomeMessage(data, respond) {
    const payload = CleanData.trim(data);
    const action = payload.actions[0].value;
    switch (action) {
      case 'book_new_trip':
        InteractivePrompts.sendBookNewTripResponse(payload, respond);
        break;
      case 'view_trips_itinerary':
        InteractivePrompts.sendTripItinerary(payload, respond);
        break;
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea'));
        break;
    }
  }

  static goodByeMessage() {
    return new SlackInteractiveMessage('Thank you for using Tembea. See you again.');
  }

  static async bookNewTrip(data, respond) {
    const payload = CleanData.trim(data);
    respond(new SlackInteractiveMessage('Noted...'));
    const action = payload.actions[0].value;
    switch (action) {
      case 'true':
      case 'false':
        await Cache.save(payload.user.id, 'forSelf', action);
        DialogPrompts.sendTripReasonForm(payload);
        break;
      default:
        respond(SlackInteractions.goodByeMessage());
    }
  }

  static isCancelMessage(data) {
    const payload = CleanData.trim(data);
    return (payload.type === 'interactive_message' && payload.actions[0].value === 'cancel');
  }

  static async handleUserInputs(data, respond) {
    const payload = CleanData.trim(data);
    const callbackId = payload.callback_id.split('_')[2];
    const scheduleTripHandler = ScheduleTripInputHandlers[callbackId];
    if (!(SlackInteractions.isCancelMessage(payload)) && scheduleTripHandler) {
      return scheduleTripHandler(payload, respond, callbackId);
    }
    // default response for cancel button
    respond(
      SlackInteractions.goodByeMessage()
    );
  }

  static async handleItineraryActions(data, respond) {
    const payload = CleanData.trim(data);
    const { name, value } = payload.actions[0];
    let message;
    switch (name) {
      case 'view':
        message = await ViewTripHelper.displayTripRequest(value, payload.user.id);
        break;
      case 'reschedule':
        message = await TripRescheduleHelper.sendTripRescheduleDialog(payload, value);
        break;
      case 'cancel_trip':
        message = await CancelTripController.cancelTrip(value);
        break;
      default:
        message = SlackInteractions.goodByeMessage();
    }
    respond(message);
  }

  static async handleReschedule(data, respond) {
    const payload = CleanData.trim(data);
    let { state } = payload;
    const {
      submission: {
        newMonth, newDate, newYear, time
      },
      user
    } = payload;
    const date = `${newDate}/${+newMonth + 1}/${newYear} ${time}`;
    state = state.split(' ');
    const { team: { id: teamId } } = payload;
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const errors = await RescheduleTripController.runValidations(date, user, slackBotOauthToken);
    if (errors.length > 0) {
      return { errors };
    }
    const message = await RescheduleTripController.rescheduleTrip(state[2], date, payload, respond);
    respond(message);
  }

  static async handleManagerActions(data, respond) {
    const payload = CleanData.trim(data);
    const { name, value } = payload.actions[0];
    const isCancelled = await SlackHelpers.handleCancellation(value);

    // Notify manager if trip has been cancelled
    if (isCancelled) {
      respond(new SlackInteractiveMessage('The trip request has already been cancelled.'));
      return;
    }
    try {
      ManagerActionsHelper[name](payload, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang:: I was unable to do that.'));
    }
  }

  static async handleTripDecline(data, respond) {
    const payload = CleanData.trim(data);
    const {
      submission: { declineReason }
    } = payload;
    const state = payload.state.split(' ');
    const teamId = payload.team.id;
    try {
      const errors = await ManageTripController.runValidation({ declineReason });
      if (errors.length > 0) {
        return { errors };
      }
      await ManageTripController.declineTrip(state, declineReason, respond, teamId);
    } catch (error) {
      bugsnagHelper.log(error);
      const errorMessage = 'Error:bangbang:: Something went wrong! Please try again.';
      const message = new SlackInteractiveMessage(errorMessage);
      respond(message);
    }
  }

  static async handleManagerApprovalDetails(data, respond) {
    const payload = CleanData.trim(data);
    try {
      const { submission: { approveReason }, user, team: { id: teamId } } = payload;
      const state = payload.state.split(' ');
      const [timeStamp, channelId, tripId] = state;
      const errors = await ManageTripController.runValidation({ approveReason });
      if (errors.length > 0) { return { errors }; }
      const hasApproved = await SlackHelpers.approveRequest(tripId, user.id, approveReason);
      if (hasApproved) {
        const trip = await tripService.getById(tripId);
        SlackEvents.raise(slackEventNames.TRIP_APPROVED, trip, payload, respond);
        const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
        InteractivePrompts.sendManagerDeclineOrApprovalCompletion(
          false, trip, timeStamp, channelId, slackBotOauthToken
        );
        return;
      }
      respond(new SlackInteractiveMessage('Error:bangbang: : '
        + 'This request could not be approved. Consult the administrator'));
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang: : '
        + 'We could not complete this process please try again.'));
    }
  }

  static approveTripRequestByManager(data, trip, respond) {
    const payload = CleanData.trim(data);
    const { channel, actions } = payload;

    if (trip.isApproved) {
      respond(new SlackInteractiveMessage(
        `This trip has already been approved by ${trip.approvedBy}`
      ));
      return;
    }
    return DialogPrompts.sendReasonDialog(payload,
      'approve_trip',
      `${payload.original_message.ts} ${channel.id} ${actions[0].value}`,
      'Approve', 'Approve', 'approveReason');
  }

  static viewTripItineraryActions(data, respond) {
    const payload = CleanData.trim(data);
    const value = payload.state || payload.actions[0].value;
    const errors = UserInputValidator.validateSkipToPage(payload);
    if (errors) return errors;
    switch (value) {
      case 'view_trips_history':
        TripItineraryController.handleTripHistory(payload, respond);
        break;
      case 'view_upcoming_trips':
        TripItineraryController.handleUpcomingTrips(payload, respond);
        break;
      default:
        break;
    }
  }

  static sendCommentDialog(data) {
    const payload = CleanData.trim(data);
    const action = payload.actions[0].name;
    switch (action) {
      case ('confirmTrip'):
        DialogPrompts.sendOperationsApprovalDialog(payload);
        break;
      case ('declineRequest'):
        DialogPrompts.sendOperationsDeclineDialog(payload);
        break;
      default:
        break;
    }
  }

  static async handleTripActions(data, respond) {
    try {
      const payload = CleanData.trim(data);
      const errors = TripActionsController.runCabValidation(payload);
      if (errors && errors.length > 0) {
        return { errors };
      }
      await TripActionsController.changeTripStatus(payload);
      respond(new SlackInteractiveMessage('Request Successful'));
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static async bookTravelTripStart(data, respond) {
    const payload = CleanData.trim(data);
    const { user: { id }, actions } = payload;
    const { name } = actions[0];
    if (name === 'cancel') {
      respond(
        new SlackInteractiveMessage('Thank you for using Tembea. See you again.')
      );
      return;
    }
    await Cache.save(id, 'tripType', name);
    return DialogPrompts.sendTripDetailsForm(
      payload, 'travelTripContactDetailsForm', 'travel_trip_contactDetails'
    );
  }

  static handleTravelTripActions(data, respond) {
    const payload = CleanData.trim(data);
    return handleActions(payload, respond, travelTripHelper);
  }

  static async startRouteActions(data, respond) {
    const payload = CleanData.trim(data);
    const action = payload.state || payload.actions[0].value;
    const errors = UserInputValidator.validateStartRouteSubmission(payload);
    if (errors) return errors;
    switch (action) {
      case 'request_new_route':
        DialogPrompts.sendLocationForm(payload);
        break;
      case 'view_available_routes':
        await JoinRouteInteractions.handleViewAvailableRoutes(payload, respond);
        break;
      default:
        respond(SlackInteractions.goodByeMessage());
        break;
    }
  }

  static handleRouteActions(data, respond) {
    try {
      const payload = CleanData.trim(data);
      const callBackName = payload.callback_id.split('_')[2];
      const routeHandler = RouteInputHandlers[callBackName];
      if (routeHandler) {
        const errors = RouteInputHandlers.runValidations(payload);
        if (errors && errors.length > 0) {
          return { errors };
        }
        return routeHandler(payload, respond);
      }
      respond(SlackInteractions.goodByeMessage());
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static completeTripResponse(data, respond) {
    try {
      const payload = CleanData.trim(data);
      const { value } = payload.actions[0];
      InteractivePrompts.sendCompletionResponse(respond, value);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang: : '
        + 'We could not complete this process please try again.'));
    }
  }
}

export default SlackInteractions;
