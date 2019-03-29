import { SlackInteractiveMessage } from '../../RouteManagement/rootFile';
import RateTripController from '../RateTripController';
import tripService from '../../../../services/TripService';
import { SlackAttachment, SlackButtonAction } from '../../SlackModels/SlackMessageModels';

describe('RateTripController', () => {
  describe('sendTripRatingMessage', () => {
    it('should return a slack interactive message', async () => {
      const addPropsSpy = jest.spyOn(SlackAttachment.prototype, 'addOptionalProps');
      const addActionsSpy = jest.spyOn(SlackAttachment.prototype, 'addFieldsOrActions');
      const buttons = RateTripController.createRatingButtons(1);

      const result = await RateTripController.sendTripRatingMessage(1);

      expect(addPropsSpy).toBeCalledWith('rate_trip');
      expect(addActionsSpy).toBeCalledWith('actions', buttons);
      expect(result.text).toEqual('*Please rate this trip on a scale of `1 - 5` :star: *');
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
      const updateSpy = jest.spyOn(tripService, 'updateRequest')
        .mockImplementation(jest.fn());
      const payload = { actions: [{ name: '1', value: '3' }] };
      const respond = jest.fn();

      await RateTripController.rateTrip(payload, respond);

      expect(updateSpy).toBeCalledWith('3', { rating: '1' });
      expect(respond).toBeCalledWith(
        new SlackInteractiveMessage('Thank you for sharing your experience.')
      );
    });
  });
});
