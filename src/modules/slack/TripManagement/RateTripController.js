/* eslint-disable camelcase */
import { SlackInteractiveMessage } from '../RouteManagement/rootFile';
import tripService from '../../../services/TripService';
import { SlackAttachment, SlackButtonAction } from '../SlackModels/SlackMessageModels';
import BatchUseRecordService from '../../../services/BatchUseRecordService';
import CleanData from '../../../helpers/cleanData';
import Interactions from '../../new-slack/trips/user/interactions';
import UserService from '../../../services/UserService';
import { HOMEBASE_NAMES } from '../../../helpers/constants';
import UpdateSlackMessageHelper from '../../../helpers/slack/updatePastMessageHelper';

class RateTripController {
  static async sendRatingMessage(tripId, prop) {
    const attachment = new SlackAttachment();
    const buttons = RateTripController.createRatingButtons(tripId);
    attachment.addOptionalProps(prop);
    attachment.addFieldsOrActions('actions', buttons);
    const message = new SlackInteractiveMessage(
      `*Please rate this ${prop.split('_')[1]} on a scale of '1 - 5' :star: *`, [attachment]
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

  static async rate(data) {
    const payload = CleanData.trim(data);
    const { actions: [{ name, value }], callback_id } = payload;
    if (callback_id === 'rate_trip') {
      await tripService.updateRequest(value, { rating: name });
      const state = {
        tripId: value,
        response_url: payload.response_url
      };
      await RateTripController.getAfterRatingAction(payload, state);
    }
    if (callback_id === 'rate_route') {
      await BatchUseRecordService.updateBatchUseRecord(value, { rating: name });
      return new SlackInteractiveMessage('Thank you for using Tembea');
    }
  }

  static async getAfterRatingAction(payload, state) {
    const { homebase: { name: homebase } } = await UserService.getUserBySlackId(payload.user.id);
    if (homebase === HOMEBASE_NAMES.KAMPALA) {
      const message = new SlackInteractiveMessage('Thank you for using Tembea');
      await UpdateSlackMessageHelper.newUpdateMessage(payload.response_url, message);
      return;
    }
    await Interactions.sendPriceForm(payload, state);
  }
}

export default RateTripController;
