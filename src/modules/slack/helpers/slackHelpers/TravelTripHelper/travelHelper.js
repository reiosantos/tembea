import InteractivePrompts from '../../../SlackPrompts/InteractivePrompts';
import LocationMapHelpers from '../../../../../helpers/googleMaps/locationsMapHelpers';
import travelTripHelper from './index';
import GoogleMapsError from '../../../../../helpers/googleMaps/googleMapsError';
import {
  SlackInteractiveMessage,
  SlackAttachment,
  SlackButtonAction
} from '../../../SlackModels/SlackMessageModels';
import Notifications from '../../../SlackPrompts/Notifications';

export default class travelHelper {
  static async getPickupType(data) {
    const { pickup } = data;
    if (pickup !== 'Others') {
      return InteractivePrompts.openDestinationDialog();
    }
    const verifiable = await LocationMapHelpers
      .locationVerify(data, 'pickup', 'travel_trip');
    return verifiable;
  }

  static async getDestinationType(payload, respond) {
    const { submission: { destination } } = payload;
    if (destination !== 'Others') {
      const confirmDetails = await travelTripHelper.detailsConfirmation(payload, respond);
      return confirmDetails;
    }
    try {
      const verifiable = await LocationMapHelpers
        .locationVerify(payload.submission, 'destination', 'travel_trip');
      if (verifiable) respond(verifiable);
    } catch (err) {
      if (err instanceof GoogleMapsError && err.code === GoogleMapsError.UNAUTHENTICATED) {
        const confirmDetails = await travelTripHelper.detailsConfirmation(payload, respond);
        respond(confirmDetails);
      }
    }
  }

  static validatePickupDestination(payload, respond) {
    const {
      pickup, teamID, userID, rider
    } = payload;

    const location = (pickup === 'To Be Decided') ? 'pickup' : 'destination';
    Notifications.sendRiderlocationConfirmNotification({
      location, teamID, userID, rider
    }, respond);

    const message = travelHelper.responseMessage(
      `Travel ${location} confirmation request.`,
      `A request has been sent to <@${rider}> to confirm his ${location} location.`,
      'Once confirmed, you will be notified promptly :smiley:',
      'confirm'
    );
    respond(message);
  }

  static responseMessage(messageTitle, messageTitleBody, messageBody, btnValue = 'confirm') {
    const attachment = new SlackAttachment(
      messageTitleBody,
      messageBody,
      '', '', '', 'default', 'warning'
    );

    const actions = [
      new SlackButtonAction('confirmTripRequest', 'Okay', btnValue),
    ];

    attachment.addFieldsOrActions('actions', actions);
    attachment.addOptionalProps('travel_trip_requesterToBeDecidedNotification',
      'fallback', undefined, 'default');

    const message = new SlackInteractiveMessage(messageTitle,
      [attachment]);
    return message;
  }
}
