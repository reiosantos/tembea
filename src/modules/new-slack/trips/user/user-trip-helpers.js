import NewSlackHelpers from '../../helpers/slack-helpers';
import tripPaymentSchema from '../schemas';
import tripService from '../../../../services/TripService';

const prefix = 'user_trip_';
export const userTripActions = Object.freeze({
  payment: `${prefix}payment`
});

export default class UserTripHelpers {
  static async savePayment(payload) {
    try {
      const { submission, state } = payload;
      submission.price = parseFloat(submission.price);
      NewSlackHelpers.dialogValidator(submission, tripPaymentSchema);
      const { tripId } = JSON.parse(state);
      const { price } = submission;
      await tripService.updateRequest(tripId, { cost: price });
    } catch (err) {
      return err;
    }
  }
}
