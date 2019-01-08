import SlackHelpers from '../../../helpers/slack/slackHelpers';
import { slackEventNames } from '../events/slackEvents';
import SlackEvents from '../events';
import SlackController from '../SlackController';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import RescheduleTripController from '../TripManagement/RescheduleTripController';
import CancelTripController from '../TripManagement/CancelTripController';
import TripItineraryHelper from '../helpers/slackHelpers/TripItineraryHelper';
import ManageTripController from '../TripManagement/ManageTripController';
import TripActionsController from '../TripManagement/TripActionsController';
import TripRescheduleHelper from '../helpers/slackHelpers/rescheduleHelper';
import Cache from '../../../cache';
import ScheduleTripInputHandlers from '../../../helpers/slack/ScheduleTripInputHandlers';
import TeamDetailsService from '../../../services/TeamDetailsService';
import travelTripHelper from '../helpers/slackHelpers/TravelTripHelper';
import bugsnagHelper from '../../../helpers/bugsnagHelper';

class SlackInteractions {
  static launch(payload, respond) {
    const action = payload.actions[0].value;
    switch (action) {
      case 'back_to_launch':
        respond(SlackController.getWelcomeMessage());
        break;
      case 'back_to_travel_launch':
        respond(SlackController.getTravelCommandMsg());
        break;
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea'));
        break;
    }
  }

  static welcomeMessage(payload, respond) {
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

  static bookNewTrip(payload, respond) {
    respond(new SlackInteractiveMessage('Noted...'));
    const action = payload.actions[0].value;
    switch (action) {
      case 'true':
      case 'false':
        Cache.save(payload.user.id, 'forSelf', action);
        DialogPrompts.sendTripReasonForm(payload);
        break;
      default:
        respond(SlackInteractions.goodByeMessage());
    }
  }

  static async handleUserInputs(payload, respond) {
    const callbackId = payload.callback_id.split('_')[2];
    const scheduleTripHandler = ScheduleTripInputHandlers[callbackId];
    if ((payload.type === 'interactive_message' && payload.actions[0].value === 'cancel')
    || !scheduleTripHandler) {
      // default response for cancel button
      return respond(
        SlackInteractions.goodByeMessage()
      );
    }
    return scheduleTripHandler(payload, respond, callbackId);
  }

  static async handleItineraryActions(payload, respond) {
    const { name, value } = payload.actions[0];
    switch (name) {
      case 'view':
        respond({ text: 'Coming soon...' });
        break;
      case 'reschedule':
        TripRescheduleHelper.sendTripRescheduleDialog(payload, respond, value);
        break;
      case 'cancel_trip':
        try {
          const message = await CancelTripController.cancelTrip(value);
          respond(new SlackInteractiveMessage(message));
        } catch (error) {
          bugsnagHelper.log(error);
          respond(new SlackInteractiveMessage(error.message));
        }
        break;
      default:
        respond(SlackInteractions.goodByeMessage());
    }
  }

  static async handleReschedule(payload, respond) {
    let { state } = payload;
    const {
      submission: {
        newMonth, newDate, newYear, time
      },
      user
    } = payload;
    const date = `${newDate}/${+newMonth + 1}/${newYear} ${time}`;
    state = state.split(' ');
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
    const errors = await RescheduleTripController.runValidations(date, user, slackBotOauthToken);
    if (errors.length > 0) {
      return { errors };
    }
    const message = await RescheduleTripController.rescheduleTrip(state[2], date, payload, respond);
    respond(message);
  }

  static async handleManagerActions(payload, respond) {
    const { value, name } = payload.actions[0];
    let trip;
    try {
      switch (name) {
        case 'manager_decline':
          DialogPrompts.sendDialogToManager(payload,
            'decline_trip',
            `${payload.original_message.ts} ${payload.channel.id} ${value}`,
            'Decline', 'Decline', 'declineReason');
          break;
        case 'manager_approve':
          trip = await SlackHelpers.isRequestApproved(value, payload.user.id);
          SlackInteractions.approveTripRequestByManager(payload, trip, respond);
          break;
        default:
          break;
      }
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang:: I was unable to do that.'));
    }
  }

  static async handleTripDecline(payload, respond) {
    const {
      submission: { declineReason }
    } = payload;
    const state = payload.state.split(' ');
    const teamId = payload.team.id;
    try {
      const errors = await ManageTripController.runValidation(declineReason);
      if (errors.length > 0) {
        return { errors };
      }
      await ManageTripController.declineTrip(state, declineReason, respond, teamId);
    } catch (error) {
      bugsnagHelper.log(error);
      const message = new SlackInteractiveMessage('Error:bangbang:: Something went wrong! Please try again.');
      respond(message);
    }
  }

  static async handleManagerApprovalDetails(payload, respond) {
    try {
      const { submission, user } = payload;
      const state = payload.state.split(' ');
      const timeStamp = state[0];
      const channelId = state[1];
      const tripId = state[2];
      const { approveReason } = submission;
      const hasApproved = await SlackHelpers.approveRequest(tripId, user.id, approveReason);

      if (hasApproved) {
        SlackEvents.raise(slackEventNames.TRIP_APPROVED, tripId, payload, respond);
        const trip = await SlackHelpers.getTripRequest(tripId);
        const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(payload.team.id);
        InteractivePrompts.sendManagerDeclineOrApprovalCompletion(false, trip, timeStamp, channelId, slackBotOauthToken);
        return;
      }
      respond(new SlackInteractiveMessage('Error:bangbang: : This request could not be approved. '
        + 'Consult the administrator'));
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang: : We could not complete this process please try again.'));
    }
  }

  static approveTripRequestByManager(payload, trip, respond) {
    const { channel, actions } = payload;

    if (trip.isApproved) {
      respond(new SlackInteractiveMessage(
        `This trip has already been approved by ${trip.approvedBy}`
      ));
      return;
    }
    return DialogPrompts.sendDialogToManager(payload,
      'approve_trip',
      `${payload.original_message.ts} ${channel.id} ${actions[0].value}`,
      'Approve', 'Approve', 'approveReason');
  }

  static viewTripItineraryActions(payload, respond) {
    const { value } = payload.actions[0];
    switch (value) {
      case 'view_trips_history':
        TripItineraryHelper.handleTripHistory(payload, respond);
        break;
      case 'view_upcoming_trips':
        TripItineraryHelper.handleUpcomingTrips(payload, respond);
        break;
      default:
        break;
    }
  }

  static sendCommentDialog(payload) {
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

  static async handleTripActions(payload, respond) {
    try {
      const errors = TripActionsController.runCabValidation(payload);
      if (errors && errors.length > 0) {
        return { errors };
      }
      await TripActionsController.changeTripStatus(payload, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }

  static bookTravelTripStart(payload, respond) {
    const { user: { id }, actions } = payload;
    const { name } = actions[0];
    if (name === 'cancel') {
      return respond(
        new SlackInteractiveMessage('Thank you for using Tembea. See you again.')
      );
    }
    Cache.save(id, 'tripType', name);
    return DialogPrompts.sendTripDetailsForm(payload, 'travelTripContactDetailsForm', 'travel_trip_contactDetails');
  }

  static handleTravelTripActions(payload, respond) {
    const callBackName = payload.callback_id.split('_')[2];
    const tripHandler = travelTripHelper[callBackName];
    if (tripHandler) {
      return tripHandler(payload, respond);
    }
    return respond(SlackInteractions.goodByeMessage());
  }

  static handleRouteActions(payload, respond) {
    const action = payload.actions[0].value;
    const comingSoon = 'Coming soon...';
    switch (action) {
      case 'request_new_route':
        respond(new SlackInteractiveMessage(comingSoon));
        break;
      case 'view_available_routes':
        respond(new SlackInteractiveMessage(comingSoon));
        break;
      default:
        respond(SlackInteractions.goodByeMessage());
        break;
    }
  }
}

export default SlackInteractions;
