import models from '../../../database/models';
import bugsnagHelper from '../../../helpers/bugsnagHelper';

const { TripRequest } = models;

class CancelTripController {
  static async cancelTrip(tripId) {
    let message;
    try {
      const trip = await TripRequest.findById(Number(tripId));
      if (!trip) {
        message = 'Trip not found';
        return message;
      }
      await TripRequest.update(
        { tripStatus: 'Cancelled' },
        { where: { id: tripId }, returning: true }
      );
      message = 'Success! Your Trip request has been cancelled';
      return message;
    } catch (error) {
      bugsnagHelper.log(error);
      message = `Request could not be processed, ${error.message}`;
      return message;
    }
  }
}

export default CancelTripController;
