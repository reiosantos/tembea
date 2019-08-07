import tripService from '../../../services/TripService';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import { SlackInteractiveMessage } from '../RouteManagement/rootFile';
import { slackEventNames, SlackEvents } from '../events/slackEvents';


class CancelTripController {
  static async cancelTrip(tripId, payload, respond) {
    let message;
    try {
      const trip = await tripService.getById(Number(tripId));
      if (!trip) {
        message = 'Trip not found';
      } else {
        await tripService.updateRequest(tripId,
          { tripStatus: 'Cancelled' });
        const {
          origin: { address: originAddress }, destination: { address: destinationAdress }
        } = trip;
        message = `Success! Your Trip request from ${originAddress} to ${destinationAdress} has been cancelled`;
        // Raise slack events to notify manager and ops that the trip has been cancelled
        if (trip.approvedById) {
          SlackEvents.raise(slackEventNames.RIDER_CANCEL_TRIP,
            payload, trip, respond);
          SlackEvents.raise(slackEventNames.NOTIFY_OPS_CANCELLED_TRIP,
            payload, trip, respond);
        }
      }
    } catch (error) {
      bugsnagHelper.log(error);
      message = `Request could not be processed, ${error.message}`;
    }
    return new SlackInteractiveMessage(message);
  }
}

export default CancelTripController;
