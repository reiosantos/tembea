import models from '../../../database/models';

const { TripRequest } = models;

class CancelTripController {
  static cancelTrip(tripId) {
    let message;
    return TripRequest.findById(Number(tripId))
      .then((trip) => {
        if (!trip) {
          message = 'Trip not found';
          return message;
        }
        return TripRequest.update(
          { tripStatus: 'Cancelled' },
          { where: { id: tripId }, returning: true }
        )
          .then(() => {
            message = 'Success! Your Trip request has been cancelled';
            return message;
          })
          .catch((error) => {
            message = `Request could not be processed, ${error.message}`;
            return message;
          });
      })
      .catch((error) => {
        message = `Request could not be processed, ${error.message}`;
        return message;
      });
  }
}

export default CancelTripController;
