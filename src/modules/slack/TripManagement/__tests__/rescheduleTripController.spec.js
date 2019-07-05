import RescheduleTripController from '../RescheduleTripController';
import tripService from '../../../../services/TripService';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import { updatedValue } from '../../../trips/__tests__/__mocks__';
import InteractivePromptSlackHelper from '../../helpers/slackHelpers/InteractivePromptSlackHelper';
import WebClientSingleton from '../../../../utils/WebClientSingleton';


jest.mock('../../SlackPrompts/Notifications.js');
jest.mock('../../events');

describe('RescheduleTripController', () => {
  beforeAll(() => {
    jest.spyOn(WebClientSingleton, 'getWebClient')
      .mockReturnValue({
        users: { info: jest.fn().mockResolvedValue({ user: { tz_offset: 3600 } }) }
      });
  });

  it('should run validations with invalid date error', async () => {
    const nextYear = new Date().getFullYear() + 1;
    const errors = await RescheduleTripController.runValidations(
      `8/1/${nextYear} 12;00`, { id: 1 }
    );

    expect(errors.length).toBe(1);
    expect(errors[0]).toEqual({
      name: 'time',
      error: 'The time should be in the 24 hours format hh:mm'
    });
  });

  it('should run validations with past date error', async () => {
    const errors = await RescheduleTripController.runValidations('8/1/2018 12:00', { id: 1 });

    expect(errors.length).toBe(3);
    expect(errors[0]).toEqual({
      name: 'newMonth',
      error: 'This date seems to be in the past!'
    }, {
      name: 'newDate',
      error: 'This date seems to be in the past!'
    }, {
      name: 'time',
      error: 'This date seems to be in the past!'
    });
  });

  it('should send reschedule completion', async () => {
    jest.spyOn(SlackHelpers, 'getUserInfoFromSlack')
      .mockResolvedValue({ tz: 'Africa/Lagos' });
    jest.spyOn(InteractivePromptSlackHelper, 'sendRescheduleCompletion')
      .mockResolvedValue();

    const payload = { id: 1, user: { id: 'AAAAAA' }, team: { id: 'AAAAAA' } };
    const respond = jest.fn();
    jest.spyOn(tripService, 'getById').mockResolvedValue(...updatedValue[1]);
    jest.spyOn(tripService, 'updateRequest').mockResolvedValue(...updatedValue[1]);

    await RescheduleTripController.rescheduleTrip(3, '12/12/2018 22:00', payload, respond);
    expect(InteractivePromptSlackHelper.sendRescheduleCompletion).toHaveBeenCalled();
  });

  it('should send trip error', async () => {
    jest.spyOn(InteractivePromptSlackHelper, 'sendTripError')
      .mockReturnValue({});
    jest.spyOn(tripService, 'getById').mockReturnValue();

    await RescheduleTripController.rescheduleTrip(3000, '12/12/2018 22:00');
    expect(InteractivePromptSlackHelper.sendTripError).toHaveBeenCalledTimes(1);
  });

  it('should send reschedule trip error', async () => {
    const err = new Error();
    jest.spyOn(InteractivePromptSlackHelper, 'sendRescheduleError')
      .mockResolvedValue();
    tripService.getById = jest.fn().mockRejectedValue(err);

    await RescheduleTripController.rescheduleTrip(3, {});
    expect(InteractivePromptSlackHelper.sendRescheduleError).toHaveBeenCalledTimes(1);
  });
});
