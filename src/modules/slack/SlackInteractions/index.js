import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import SlackNotifications from '../../../helpers/slack/notifications';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import ScheduleTripController from '../TripManagement/ScheduleTripController';
import RescheduleTripController from '../TripManagement/RescheduleTripController';
import CancelTripController from '../TripManagement/CancelTripController';

class SlackInteractions {
  static welcomeMessage(payload, respond) {
    const action = payload.actions[0].value;
    switch (action) {
      case 'book_new_trip':
        InteractivePrompts.sendBookNewTripResponse(payload, respond);
        break;
      case 'view_open_trips':
        respond(
          new SlackInteractiveMessage('Your pending trips will arrive shortly.')
        );
        break;
      case 'view_avilable_routes':
        respond(
          new SlackInteractiveMessage('Available routes will be shown soon.')
        );
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
      const requestId = await ScheduleTripController.createRequest(payload, respond);
      SlackNotifications.notifyNewTripRequests(payload, respond);
      InteractivePrompts.sendCompletionResponse(payload, respond, requestId);
    } catch (error) {
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }

  static handleItinerary(payload, respond) {
    const { name, value } = payload.actions[0];
    switch (name) {
      case 'view':
        respond({ text: 'Coming soon...' });
        break;
      case 'reschedule':
        DialogPrompts.sendRescheduleTripForm(payload, 'reschedule_trip',
          `reschedule ${payload.response_url} ${value}`, 'Reschedule Trip');
        break;
      case 'cancel_trip':
        {
          const tripId = value;
          CancelTripController.cancelTrip(tripId)
            .then((message) => {
              respond(new SlackInteractiveMessage(message));
            })
            .catch(e => respond(new SlackInteractiveMessage(e.message)));
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
      }, user
    } = payload;
    const date = `${+newMonth + 1}/${newDate}/${newYear} ${time}`;

    state = state.split(' ');
    switch (state[0]) {
      case 'reschedule': {
        const errors = await RescheduleTripController.runValidations(date, user);
        if (errors.length > 0) {
          return { errors };
        }
        const message = await RescheduleTripController.rescheduleTrip(state[2], date, respond);
        respond(message);
        break;
      }
      default:
        respond(new SlackInteractiveMessage('Thank you for using Tembea'));
        break;
    }
  }
}

export default SlackInteractions;
