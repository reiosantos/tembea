import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import ScheduleTripController from '../TripManagement/ScheduleTripController';

class SlackInteractions {
  static welcomeMessage(payload, respond) {
    const action = payload.actions[0].value;
    switch (action) {
      case 'book_new_trip':
        InteractivePrompts.SendBookNewTripResponse(payload, respond);
        break;
      case 'view_open_trips':
        respond(new SlackInteractiveMessage('Your pending trips will arrive shortly.'));
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
        DialogPrompts.sendTripDetailsForm(payload, action === 'true');
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
      const requestId = ScheduleTripController.createRequest(payload, respond);
      InteractivePrompts.SendCompletionResponse(payload, respond, requestId);
    } catch (error) {
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }

  static handleItinerary(payload, respond) {
    const { name } = payload.actions[0];
    switch (name) {
      case 'view':
      case 'reschedule':
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
}

export default SlackInteractions;
