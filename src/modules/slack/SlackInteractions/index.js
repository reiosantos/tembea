import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import ScheduleTripController from '../TripManagement/ScheduleTripController';
import RescheduleTripController from '../TripManagement/RescheduleTripController';

class SlackInteractions {
  static welcomeMessage(payload, respond) {
    const action = payload.actions[0].value;
    switch (action) {
      case 'book_new_trip':
        InteractivePrompts.SendBookNewTripResponse(payload, respond);
        break;
      case 'view_open_trips':
        respond(
          new SlackInteractiveMessage('Your pending trips will arrive shortly.')
        );
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
      InteractivePrompts.SendCompletionResponse(payload, respond, requestId);
    } catch (error) {
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }

  static handleItinerary(payload, respond) {
    const { name, value } = payload.actions[0];
    switch (name) {
      case 'view':
        respond({
          text: 'Coming soon...'
        });
        break;
      case 'reschedule':
        DialogPrompts.sendRescheduleTripForm(payload,
          'reschedule_trip',
          `reschedule ${payload.response_url} ${value}`,
          'Reschedule Trip');
        break;
      case 'cancel':
        respond(
          new SlackInteractiveMessage(`Handle \`${name} trip\` as you would`)
        );
        break;
      default:
        respond(
          new SlackInteractiveMessage(
            'Thank you for using Tembea. See you again.'
          )
        );
    }
  }

  static async handleReschedule(payload, respond) {
    let { state } = payload;
    const { submission, user } = payload;
    const date = `${+submission.new_month + 1}/${submission.new_date}/${submission.new_year} ${submission.time}`;
    
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
