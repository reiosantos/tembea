import RateTripController from '../RateTripController';
import { SlackAttachment, SlackButtonAction } from '../../SlackModels/SlackMessageModels';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import WebClientSingleton from '../../../../utils/WebClientSingleton';
import Interactions from '../../../new-slack/trips/user/interactions';
import tripService from '../../../../services/TripService';

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

  describe('rateTrip', () => {
    it('should rate trip and respond with a SlackInteractiveMessage', async () => {
      const getWebClientMock = mock => ({
        dialog: { open: mock }
      });
      const open = jest.fn().mockResolvedValue({ status: true });
      jest.spyOn(tripService, 'getById').mockResolvedValue({});
      jest.spyOn(TeamDetailsService, 'getTeamDetails').mockResolvedValue({ botToken: { slackBotOauthToken: 'ABCDE' } });
      jest.spyOn(WebClientSingleton, 'getWebClient')
        .mockReturnValue(getWebClientMock(open));
      jest.spyOn(Interactions, 'sendPriceForm');
      const payload = {
        actions: [{ name: '1', value: '3' }], callback_id: 'rate_trip', team: { id: 'random' }
      };
      const respond = jest.fn();

      await RateTripController.rate(payload, respond);

      expect(Interactions.sendPriceForm).toHaveBeenCalled();
    });
  });
});
