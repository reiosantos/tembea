import tripService from '../../../services/TripService';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import { SlackInteractiveMessage } from '../RouteManagement/rootFile';


class CancelTripController {
  static async cancelTrip(tripId) {
    let message;
    try {
      const trip = await tripService.getById(Number(tripId));
      if (!trip) {
        message = 'Trip not found';
      } else {
        await tripService.updateRequest(tripId,
          { tripStatus: 'Cancelled' });
        message = 'Success! Your Trip request has been cancelled';
      }
    } catch (error) {
      bugsnagHelper.log(error);
      message = `Request could not be processed, ${error.message}`;
    }
    return new SlackInteractiveMessage(message);
  }
}

export default CancelTripController;
