import SlackHelpers from '../../../helpers/slack/slackHelpers';
import { slackEventNames } from '../events/slackEvents';
import SlackEvents from '../events';
import SlackController from '../SlackController';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import TripItineraryController from '../TripManagement/TripItineraryController';
import ManageTripController from '../TripManagement/ManageTripController';
import TripActionsController from '../TripManagement/TripActionsController';
import Cache from '../../../cache';
import TeamDetailsService from '../../../services/TeamDetailsService';
import TravelTripHelper, { getTravelKey } from '../helpers/slackHelpers/TravelTripHelper';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import RouteInputHandlers from '../RouteManagement';
import ManagerActionsHelper from '../helpers/slackHelpers/ManagerActionsHelper';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import handleActions from './SlackInteractionsHelper';
import JoinRouteInteractions from '../RouteManagement/JoinRoute/JoinRouteInteractions';
import tripService from '../../../services/TripService';
import CleanData from '../../../helpers/cleanData';
import ProvidersController from '../RouteManagement/ProvidersController';
import SlackNotifications from '../SlackPrompts/Notifications';
import { providerErrorMessage } from '../../../helpers/constants';
import SlackInteractionsHelpers from '../helpers/slackHelpers/SlackInteractionsHelpers';
import InteractivePromptSlackHelper from '../helpers/slackHelpers/InteractivePromptSlackHelper';
import ProviderService from '../../../services/ProviderService';

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

  static async handleManagerActions(data, respond) {
    const payload = CleanData.trim(data);
    const { name, value } = payload.actions[0];
    const isCancelled = await SlackHelpers.handleCancellation(value);
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

  static async handleTripActions(data, respond) {
    try {
      const payload = CleanData.trim(data);
      const { callback_id: callbackId } = payload;
      const errors = (callbackId === 'operations_reason_dialog_trips')
        ? TripActionsController.runCabValidation(payload) : [];
      if (errors && errors.length > 0) return { errors };
      await TripActionsController.changeTripStatus(payload);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static async handleSelectCabActions(payload, respond) {
    const { user: { id: slackId }, actions } = payload;
    const { id: providerId } = await ProviderService.getProviderBySlackId(slackId);
    const tripId = actions[0].value;
    const { providerId: assignedProviderId } = await tripService.getById(tripId);
    if (providerId === assignedProviderId) {
      return DialogPrompts.sendSelectCabDialog(payload);
    }
    return respond(new SlackInteractiveMessage(':x: This trip has been assigned to another provider'));
  }

  /**
   * Action handler for input selectors on provider dialog
   *
   * @static
   * @param {Object} data - The request payload
   * @memberof SlackInteractions
   */
  static async handleSelectProviderAction(data) {
    try {
      if (data.actions && (data.actions[0].name === 'confirmTrip' || data.actions[0].name === 'assign-cab-or-provider')) {
        await DialogPrompts.sendSelectProviderDialog(data);
      }
    } catch (error) {
      const {
        channel: { id: channel },
        team: { id: teamId }
      } = data;
      const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
      await SlackNotifications.sendNotification(
        SlackNotifications.createDirectMessage(channel, providerErrorMessage), slackBotOauthToken
      );
    }
    if (data.actions && data.actions[0].name === 'declineRequest') {
      await DialogPrompts.sendOperationsDeclineDialog(data);
    }
  }

  static async handleSelectCabAndDriverAction(data, respond) {
    if (data && data.callback_id === 'providers_approval_trip') {
      await TripActionsController.completeTripRequest(data, respond);
    } else {
      await ProvidersController.handleProviderRouteApproval(data, respond);
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
    await Cache.save(getTravelKey(id), 'tripType', name);
    return DialogPrompts.sendTripDetailsForm(
      payload, 'travelTripContactDetailsForm', 'travel_trip_contactDetails'
    );
  }

  static handleTravelTripActions(data, respond) {
    const payload = CleanData.trim(data);
    return handleActions(payload, respond, TravelTripHelper);
  }

  static async startRouteActions(data, respond) {
    Cache.save('url', 'response_url', data.response_url);
    const payload = CleanData.trim(data);
    const action = payload.state || payload.actions[0].value;
    const errors = UserInputValidator.validateStartRouteSubmission(payload);
    if (errors) return errors;
    switch (action) {
      case 'my_current_route':
        await JoinRouteInteractions.sendCurrentRouteMessage(payload, respond);
        break;
      case 'request_new_route':
        DialogPrompts.sendLocationForm(payload);
        break;
      case 'view_available_routes':
        await JoinRouteInteractions.handleViewAvailableRoutes(payload, respond);
        break;
      default:
        respond(SlackInteractionsHelpers.goodByeMessage());
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
        if (errors && errors.length > 0) return { errors };
        return routeHandler(payload, respond);
      }
      respond(SlackInteractionsHelpers.goodByeMessage());
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
      InteractivePromptSlackHelper.sendCompletionResponse(respond, value, payload.user.id);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang: : '
        + 'We could not complete this process please try again.'));
    }
  }

  static async handleProviderApproval(payload) {
    return DialogPrompts.sendSelectCabDialog(payload);
  }
}

export default SlackInteractions;
