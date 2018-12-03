import TripActionsController from '../TripActionsController';
import SendNotifications from '../../SlackPrompts/Notifications';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';

describe('abishai test', () => {
  it('should run the catchBlock on error', async (done) => {
    const state = JSON.stringify({ trip: 1, actionTs: 212132 });
    const payload = {
      user: {
        id: 1
      },
      submission: {
        comment: 'leon took it'
      },
      channel: {
        id: 'CE0F7SZNU'
      },
      state
    };
    const respond = jest.fn(value => value);
    try {
      await TripActionsController.changeTripStatus(payload, respond);
    } catch (error) {
      expect(error.message).toEqual('operator does not exist: character varying = integer');
    }
    done();
  });

  it('should run changeTripStatus()', async (done) => {
    const state = JSON.stringify({ trip: 1, actionTs: 212132 });
    const payload = {
      user: {
        id: 'TEST123'
      },
      submission: {
        comment: 'leon took it'
      },
      channel: {
        id: 'CE0F7SZNU'
      },
      state
    };
    SendNotifications.sendUserNotification = jest.fn();
    SendNotifications.sendManagerNotification = jest.fn();
    InteractivePrompts.sendDeclineCompletion = jest.fn();
    const respond = jest.fn(value => value);
    const result = await TripActionsController.changeTripStatus(payload, respond);
    expect(result).toEqual('success');
    expect(SendNotifications.sendUserNotification).toHaveBeenCalled();
    expect(SendNotifications.sendManagerNotification).toHaveBeenCalled();
    expect(InteractivePrompts.sendDeclineCompletion).toHaveBeenCalled();

    done();
  });
});
