import RateTripController from '../RateTripController';
import {
  SlackAttachment,
  SlackButtonAction,
  SlackInteractiveMessage
}
  from '../../SlackModels/SlackMessageModels';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import WebClientSingleton from '../../../../utils/WebClientSingleton';
import Interactions from '../../../new-slack/trips/user/interactions';
import tripService from '../../../../services/TripService';
import BatchUseRecordService from '../../../../services/BatchUseRecordService';
import UserService from '../../../../services/UserService';
import UpdateSlackMessageHelper from '../../../../helpers/slack/updatePastMessageHelper';

describe('RateTripController', () => {
  describe('sendTripRatingMessage', () => {
    it('should return a slack interactive message', async () => {
      const addPropsSpy = jest.spyOn(SlackAttachment.prototype, 'addOptionalProps');
      const addActionsSpy = jest.spyOn(SlackAttachment.prototype, 'addFieldsOrActions');
      const buttons = RateTripController.createRatingButtons(1);

      const result = await RateTripController.sendRatingMessage(1, 'rate_trip');

      expect(addPropsSpy).toBeCalledWith('rate_trip');
      expect(addActionsSpy).toBeCalledWith('actions', buttons);
      expect(result.text).toEqual('*Please rate this trip on a scale of \'1 - 5\' :star: *');
      expect(result.attachments[0].actions).toHaveLength(5);
    });
  });

  describe('createRatingButtons', () => {
    it('should return an array of buttons of length 5', () => {
      const result = RateTripController.createRatingButtons(3);

      expect(result).toHaveLength(5);
      expect(result[2]).toEqual(
        new SlackButtonAction(3, '3 :neutral_face:', 3, 'default')
      );
    });
  });

  describe('getAfterRatingAction', () => {
    const payload = { user: { id: 'SHDAA' }, response_url: 'url' };
    it('should Update message if homebase is KAMPALA', async () => {
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue({
        homebase: { name: 'Kampala' }
      });
      jest.spyOn(UpdateSlackMessageHelper, 'newUpdateMessage');
      await RateTripController.getAfterRatingAction(payload, {});
      expect(UpdateSlackMessageHelper.newUpdateMessage).toBeCalled();
    });
    it('should send Price Form if homebase is not Kampala ', async () => {
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue({
        homebase: { name: 'Nairobi' }
      });
      jest.spyOn(Interactions, 'sendPriceForm').mockResolvedValue({});
      await RateTripController.getAfterRatingAction(payload, {});
      expect(Interactions.sendPriceForm).toBeCalled();
    });
  });

  describe('rateTrip', () => {
    const respond = jest.fn();
    const getWebClientMock = (mock) => ({
      dialog: { open: mock }
    });
    beforeAll(() => {
      jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});
      jest.spyOn(TeamDetailsService, 'getTeamDetails')
        .mockResolvedValue({ botToken: { slackBotOauthToken: 'ABCDE' } });
      jest.spyOn(Interactions, 'sendPriceForm');
    });

    it('should call getAfterRatingAction if action is rate_trip', async () => {
      const open = jest.fn().mockResolvedValue({ status: true });
      jest.spyOn(WebClientSingleton, 'getWebClient')
        .mockReturnValue(getWebClientMock(open));
      const payload = {
        actions: [{ name: '1', value: '3' }], callback_id: 'rate_trip', team: { id: 'random' }
      };
      jest.spyOn(RateTripController, 'getAfterRatingAction').mockResolvedValue({});
      await RateTripController.rate(payload, respond);
      expect(RateTripController.getAfterRatingAction).toBeCalled();
    });

    it('should call BatchUseRecordService.updateBatchUseRecord if action is rate_route',
      async () => {
        const payload = {
          actions: [{ name: '1', value: '3' }], callback_id: 'rate_route', team: { id: 'random' }
        };
        jest.spyOn(BatchUseRecordService, 'updateBatchUseRecord').mockResolvedValue({});
        const response = await RateTripController.rate(payload, respond);
        expect(BatchUseRecordService.updateBatchUseRecord).toBeCalled();
        expect(response).toBeInstanceOf(SlackInteractiveMessage);
      });
  });
});
