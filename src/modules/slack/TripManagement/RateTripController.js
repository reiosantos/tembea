import {
  SlackDialog, SlackDialogText, SlackDialogError
} from '../SlackModels/SlackDialogModels';
import { DialogPrompts, SlackInteractiveMessage } from '../RouteManagement/rootFile';
import tripService from '../../../services/TripService';

class RateTripController {
  static async sendTripRatingDialog(payload, tripId) {
    const dialog = new SlackDialog(
      'rate_trip', 'Rate this trip', 'Submit', false, tripId
    );
    const textInput = new SlackDialogText(
      'Rating', 'rating', '', false, 'Rating between 1 - 5 e.g. 4'
    );
    dialog.addElements([textInput]);
    await DialogPrompts.sendDialog(dialog, payload);
  }

  static async rateTrip(payload, respond) {
    const { submission: { rating }, state: tripId } = payload;
    const errors = RateTripController.ratingFormValidator(rating);
    if (errors.length > 0) return { errors };
    await tripService.updateRequest(tripId, { rating });
    respond(new SlackInteractiveMessage('Thank you for sharing your experience.'));
  }

  static ratingFormValidator(rating) {
    const error = new SlackDialogError(
      'rating', 'Enter a valid number between 1 and 5. See hint.'
    );
    const convertedRating = Number(rating);
    const numberRating = Number.isInteger(convertedRating);
    return (!numberRating || convertedRating < 1 || convertedRating > 5) ? [error] : [];
  }
}

export default RateTripController;
