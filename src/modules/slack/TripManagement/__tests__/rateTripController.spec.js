import {
  SlackDialog, SlackDialogText, SlackDialogError
} from '../../SlackModels/SlackDialogModels';
import { DialogPrompts, SlackInteractiveMessage } from '../../RouteManagement/rootFile';
import RateTripController from '../RateTripController';
import tripService from '../../../../services/TripService';

describe('RateTripController', () => {
  describe('sendRatingDialog', () => {
    it('should send a dialog with one text field', () => {
      const addElementsSpy = jest.spyOn(SlackDialog.prototype, 'addElements');
      const sendDialogSpy = jest.spyOn(DialogPrompts, 'sendDialog')
        .mockImplementation(jest.fn());
      const textInput = new SlackDialogText(
        'Rating', 'rating', '', false, 'Rating between 1 - 5 e.g. 4'
      );

      RateTripController.sendTripRatingDialog({}, 1);

      expect(addElementsSpy).toBeCalledWith([textInput]);
      expect(sendDialogSpy).toBeCalledTimes(1);
    });
  });

  describe('rateTrip', () => {
    const error = new SlackDialogError('rating', 'Enter a valid number between 1 and 5. See hint.');
    const errors = { errors: [error] };

    afterEach(() => {
      jest.resetAllMocks();
      jest.resetAllMocks();
    });

    it('should rate trip and respond with a SlackInteractiveMessage', async () => {
      const updateSpy = jest.spyOn(tripService, 'updateRequest')
        .mockImplementation(jest.fn());
      const payload = { state: 1, submission: { rating: '5' } };
      const respond = jest.fn();

      await RateTripController.rateTrip(payload, respond);

      expect(updateSpy).toBeCalledWith(1, { rating: '5' });
      expect(respond).toBeCalledWith(new SlackInteractiveMessage('Thank you for sharing your experience.'));
    });

    it('should return error if rating is less than 1', async () => {
      const payload = { state: 1, submission: { rating: '0' } };
      const respond = jest.fn();

      const result = await RateTripController.rateTrip(payload, respond);

      expect(result).toEqual(errors);
      expect(respond).not.toBeCalled();
    });

    it('should return error if rating is greater than 5', async () => {
      const payload = { state: 1, submission: { rating: '6' } };
      const respond = jest.fn();

      const result = await RateTripController.rateTrip(payload, respond);

      expect(result).toEqual(errors);
      expect(respond).not.toBeCalled();
    });

    it('should return error if rating is invalid', async () => {
      const payload = { state: 1, submission: { rating: 'h' } };
      const respond = jest.fn();

      const result = await RateTripController.rateTrip(payload, respond);

      expect(result).toEqual(errors);
      expect(respond).not.toBeCalled();
    });

    it('should return error if rating is empty', async () => {
      const payload = { state: 1, submission: { rating: '  ' } };
      const respond = jest.fn();

      const result = await RateTripController.rateTrip(payload, respond);

      expect(result).toEqual(errors);
      expect(respond).not.toBeCalled();
    });
  });
});
