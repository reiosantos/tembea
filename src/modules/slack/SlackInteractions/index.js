import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import SlackNotifications from '../../../helpers/slack/notifications';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import ScheduleTripController from '../TripManagement/ScheduleTripController';
import RescheduleTripController from '../TripManagement/RescheduleTripController';
import CancelTripController from '../TripManagement/CancelTripController';
import SlackController from '../SlackController';
import ManageTripController from '../TripManagement/ManageTripController';
import TripRescheduleHelper from '../helpers/slackHelpers/rescheduleHelper';

class SlackInteractions {
  static launch(payload, respond) {
    const action = payload.actions[0].value;
    switch (action) {
      case 'back_to_launch':
        respond(SlackController.getWelcomeMessage());
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
      case 'view_available_routes':
        respond(new SlackInteractiveMessage('Available routes will be shown soon.'));
        break;
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea'));
        break;
    }
  }

  static bookNewTrip(payload, respond) {
    const action = payload.actions[0].value;
    switch (action) {
      case 'true':
      case 'false':
        DialogPrompts.sendTripDetailsForm(payload, action);
        break;
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea. See you again.'));
    }
  }

  static async handleUserInputs(payload, respond) {
    const errors = await ScheduleTripController.runValidations(payload);
    if (errors.length > 0) {
      return { errors };
    }
    try {
      const requestId = await ScheduleTripController.createRequest(payload);
      SlackNotifications.notifyNewTripRequests(payload, respond);
      InteractivePrompts.sendCompletionResponse(payload, respond, requestId);
    } catch (error) {
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
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
        {
          const tripId = value;
          try {
            const message = await CancelTripController.cancelTrip(tripId);
            respond(new SlackInteractiveMessage(message));
          } catch (error) {
            respond(new SlackInteractiveMessage(error.message));
          }
        }
        break;
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea. See you again.'));
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
    const errors = await RescheduleTripController.runValidations(date, user);
    if (errors.length > 0) {
      return { errors };
    }
    const message = await RescheduleTripController.rescheduleTrip(state[2], date, respond);
    respond(message);
  }

  static handleManagerDecline(payload, respond) {
    const { value } = payload.actions[0];
    try {
      DialogPrompts.sendDeclineDialog(
        payload,
        'decline_trip',
        `${payload.original_message.ts} ${payload.channel.id} ${value}`,
        'Decline'
      );
    } catch (error) {
      respond(new SlackInteractiveMessage('Error:bangbang:: I was unable to do that.'));
    }
  }

  static async handleTripDecline(payload, respond) {
    const {
      submission: { declineReason }
    } = payload;
    const state = payload.state.split(' ');
    try {
      const errors = await ManageTripController.runValidation(declineReason);
      if (errors.length > 0) {
        return { errors };
      }
      await ManageTripController.declineTrip(state, declineReason, respond);
    } catch (error) {
      const message = new SlackInteractiveMessage(
        'Error:bangbang:: Something went wrong! Please try again.'
      );
      respond(message);
    }
  }
}

export default SlackInteractions;
