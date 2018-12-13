import TripActionsController from '../TripActionsController';
import SendNotifications from '../../SlackPrompts/Notifications';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import models from '../../../../database/models';

describe('TripActionController operations decline tests', () => {
  let respond;

  beforeEach(() => {
    respond = jest.fn(value => value);
  });

  const state = JSON.stringify({ trip: 1000000, actionTs: 212132 });
  const payload = {
    user: {
      id: 'TEST123'
    },
    channel: {
      id: 'CE0F7SZNU'
    },
    submission: {
      comment: 'abishai has it'
    },
    state
  };

  it('should run the catchBlock on error', async (done) => {
    try {
      await TripActionsController.changeTripStatus(payload, respond);
    } catch (error) {
      expect(respond).toHaveBeenCalled();
    }
    done();
  });

  it('should run changeTripStatus() to declinedByOps', async (done) => {
    const validState = JSON.stringify({ trip: 1, actionTs: 212132 });
    payload.state = validState;
    SendNotifications.sendUserNotification = jest.fn();
    SendNotifications.sendManagerNotification = jest.fn();
    InteractivePrompts.sendOpsDeclineOrApprovalCompletion = jest.fn();
    const result = await TripActionsController.changeTripStatus(payload, respond);
    expect(result).toEqual('success');
    expect(SendNotifications.sendUserNotification).toHaveBeenCalled();
    expect(SendNotifications.sendManagerNotification).toHaveBeenCalled();
    expect(InteractivePrompts.sendOpsDeclineOrApprovalCompletion).toHaveBeenCalled();

    done();
  });
});

describe('TripActionController operations approve tests', () => {
  let respond;

  beforeEach(() => {
    respond = jest.fn(value => value);
  });

  const payload = {
    user: {
      id: 1
    },
    channel: {
      id: 1
    },
    submission: {
      confirmationComment: 'derick has it',
      driverName: 'derick',
      driverPhoneNo: '07000000000',
      regNumber: 'KAA 666 Q'
    },
    state: '{ "tripId": "13" }'
  };

  it('should run changeTripStatus() to approvedByOps', async (done) => {
    SendNotifications.sendUserConfirmNotification = jest.fn();
    SendNotifications.sendManagerConfirmNotification = jest.fn();
    await TripActionsController.changeTripStatus(payload, respond);
    expect(SendNotifications.sendUserConfirmNotification).toHaveBeenCalled();
    expect(SendNotifications.sendManagerConfirmNotification).toHaveBeenCalled();

    done();
  });

  it('should run the catchBlock on error', async (done) => {
    const { Cab } = models;
    Cab.findOrCreate = jest.fn(() => Promise.reject(new Error('Dummy error')));
    SendNotifications.sendUserConfirmNotification = jest.fn();
    SendNotifications.sendManagerConfirmNotification = jest.fn();
    await TripActionsController.changeTripStatus(payload, respond);
    expect(respond).toHaveBeenCalled();
    done();
  });
});
