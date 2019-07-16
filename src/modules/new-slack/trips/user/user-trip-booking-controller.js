import UserTripHelpers from './user-trip-helpers';
import {
  Block, BlockMessage
} from '../../models/slack-block-models';

export default class UserTripBookingController {
  static async paymentRequest(payload, respond) {
    if (payload.submission) {
      const result = await UserTripHelpers.savePayment(payload);
      if (result && result.errors) return result;
    }
    const message = new BlockMessage([new Block().addText('Thank you for using Tembea')]);
    respond(message);
  }
}
