import RescheduleTripController from '../RescheduleTripController';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import SlackEvents from '../../events';
import tripService from '../../../../services/TripService';


jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../SlackPrompts/Notifications.js');
jest.mock('../../events', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  }))
}));
jest.mock('../../events/slackEvents', () => ({
  SlackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
  slackEventNames: Object.freeze({
    TRIP_APPROVED: 'trip_approved',
    TRIP_WAITING_CONFIRMATION: 'trip_waiting_confirmation',
    NEW_TRIP_REQUEST: 'new_trip_request',
    DECLINED_TRIP_REQUEST: 'declined_trip_request'
  })
}));

describe('RescheduleTripController', () => {
  it('should get user information', async (done) => {
    const userInfo = await RescheduleTripController.getUserInfo();

    expect(userInfo).toEqual({ tz_offset: 3600 });
    done();
  });

  it('should run validations with invalid date error', async (done) => {
    const nextYear = new Date().getFullYear() + 1;

    const errors = await RescheduleTripController.runValidations(
      `8/1/${nextYear} 12;00`, { id: 1 }
    );

    expect(errors.length).toBe(1);
    expect(errors[0]).toEqual({
      name: 'time',
      error: 'The time should be in the 24 hours format hh:mm'
    });
    done();
  });

  it('should run validations with past date error', async (done) => {
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
    done();
  });

  it('should send reschedule completion', async () => {
    InteractivePrompts.sendRescheduleCompletion = jest.fn(() => {});
    const payload = { id: 1 };
    const respond = jest.fn();
    SlackEvents.raise = jest.fn();
    tripService.getById = jest.fn(() => ({
      save: jest.fn()
    }));

    await RescheduleTripController.rescheduleTrip(3, '12/12/2018 22:00', payload, respond);

    expect(InteractivePrompts.sendRescheduleCompletion.mock.calls.length).toBe(1);
  });

  it('should send trip error', async () => {
    InteractivePrompts.sendTripError = jest.fn(() => {});
    tripService.getById = jest.fn(() => { });

    await RescheduleTripController.rescheduleTrip(3000, '12/12/2018 22:00');

    expect(InteractivePrompts.sendTripError.mock.calls.length).toBe(1);
  });

  it('should send reschedule trip error', async () => {
    const err = new Error();
    InteractivePrompts.sendRescheduleError = jest.fn(() => {});
    tripService.getById = jest.fn(() => Promise.reject(err));

    await RescheduleTripController.rescheduleTrip(3, {});

    expect(InteractivePrompts.sendRescheduleError.mock.calls.length).toBe(1);
  });
});
