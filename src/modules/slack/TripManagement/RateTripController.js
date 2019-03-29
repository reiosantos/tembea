import { SlackInteractiveMessage } from '../RouteManagement/rootFile';
import tripService from '../../../services/TripService';
import { SlackAttachment, SlackButtonAction } from '../SlackModels/SlackMessageModels';

class RateTripController {
  static async sendTripRatingMessage(tripId) {
    const attachment = new SlackAttachment();
    const buttons = RateTripController.createRatingButtons(tripId);
    attachment.addOptionalProps('rate_trip');
    attachment.addFieldsOrActions('actions', buttons);
    const message = new SlackInteractiveMessage(
      '*Please rate this trip on a scale of `1 - 5` :star: *', [attachment]
    );
    return message;
  }

  static createRatingButtons(tripId) {
    return [
      new SlackButtonAction(1, '1 :disappointed:', tripId, 'danger'),
      new SlackButtonAction(2, '2 :slightly_frowning_face:', tripId, 'danger'),
      new SlackButtonAction(3, '3 :neutral_face:', tripId, 'default'),
      new SlackButtonAction(4, '4 :simple_smile:', tripId),
      new SlackButtonAction(5, '5 :star-struck:', tripId)
    ];
  }

  static async rateTrip(payload, respond) {
    const { actions: [{ name, value }] } = payload;
    await tripService.updateRequest(value, { rating: name });
    respond(new SlackInteractiveMessage('Thank you for sharing your experience.'));
  }
}

export default RateTripController;
