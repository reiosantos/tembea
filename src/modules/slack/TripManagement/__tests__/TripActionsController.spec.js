import TripActionsController from '../TripActionsController';
import SendNotifications from '../../SlackPrompts/Notifications';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import UserInputValidator from '../../../../helpers/slack/UserInputValidator';
import models from '../../../../database/models';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import { cabService } from '../../../../services/CabService';
import tripService from '../../../../services/TripService';
import ProviderNotifications from '../../SlackPrompts/notifications/ProviderNotifications';
import DriverNotifications from
  '../../SlackPrompts/notifications/DriverNotifications/driver.notifications.ts';
import DriverService from '../../../../services/DriverService';

const { TripRequest, Address } = models;

jest.mock('../../SlackPrompts/Notifications.js');
jest.mock('../../events/', () => ({
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

jest.mock('../../../../services/TeamDetailsService', () => ({
  getTeamDetailsBotOauthToken: jest.fn(() => Promise.resolve('token'))
}));

jest.mock('../../SlackPrompts/Notifications.js');
jest.mock('../../events/', () => ({
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

describe('TripActionController operations decline tests', () => {
  const state = JSON.stringify({ trip: 1000000, actionTs: 212132 });
  const opsUserId = 1;
  let payload;

  beforeEach(() => {
    payload = {
      user: {
        id: 'TEST123'
      },
      channel: {
        id: 'CE0F7SZNU'
      },
      team: {
        id: 1
      },
      submission: {
        opsDeclineComment: 'abishai has it'
      },
      state
    };
    jest.spyOn(cabService, 'findOrCreateCab')
      .mockImplementation((driverName, driverPhoneNo, regNumber) => Promise.resolve({
        driverName, driverPhoneNo, regNumber
      }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should run changeTripToDeclined()', async () => {
    TeamDetailsService.getTeamDetailsBotOauthToken = jest.fn(() => Promise.resolve('token'));
    const findOrCreateUserBySlackId = jest.spyOn(SlackHelpers,
      'findOrCreateUserBySlackId');
    findOrCreateUserBySlackId.mockImplementation(() => ({
      id: 1
    }));
    const changeTripStatusToDeclined = jest.spyOn(
      TripActionsController, 'changeTripStatusToDeclined'
    );
    changeTripStatusToDeclined.mockImplementation(() => { });

    await TripActionsController.changeTripStatus(payload);

    expect(findOrCreateUserBySlackId).toHaveBeenCalledTimes(1);
    expect(changeTripStatusToDeclined).toHaveBeenCalledWith(1, payload, 'token');
  });

  it('should go to the changeTripStatus() catch block on error', async () => {
    const findOrCreateUserBySlackId = jest.spyOn(SlackHelpers,
      'findOrCreateUserBySlackId');
    findOrCreateUserBySlackId.mockImplementation(() => Promise.reject(new Error()));
    const changeTripStatusToConfirmed = jest.spyOn(
      TripActionsController, 'changeTripStatusToConfirmed'
    );
    changeTripStatusToConfirmed.mockImplementation(() => { });

    const response = await TripActionsController.changeTripStatus(payload);

    expect(findOrCreateUserBySlackId).toHaveBeenCalledTimes(1);
    expect(changeTripStatusToConfirmed).not.toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  it('should run changeTripStatus() to declinedByOps', async () => {
    const { id: destinationId } = await Address.findOne();
    const trip = await TripRequest.create({
      destinationId,
      name: 'A trip',
      riderId: 1,
      tripStatus: 'Approved',
      originId: 1,
      departureTime: '2018-12-12- 22:00',
      requestedById: 1,
      departmentId: 1,
      reason: 'I need to go',
      noOfPassengers: 1,
      tripType: 'Regular Trip'
    });

    const validState = JSON.stringify({ trip: trip.id, actionTs: 212132 });
    payload.state = validState;
    SendNotifications.sendUserConfirmOrDeclineNotification = jest.fn();
    SendNotifications.sendManagerConfirmOrDeclineNotification = jest.fn();
    InteractivePrompts.sendOpsDeclineOrApprovalCompletion = jest.fn();

    const result = await TripActionsController.changeTripStatusToDeclined(
      opsUserId, payload, '1234'
    );

    expect(result).toEqual('success');
    expect(SendNotifications.sendUserConfirmOrDeclineNotification).toHaveBeenCalled();
    expect(SendNotifications.sendManagerConfirmOrDeclineNotification).toHaveBeenCalled();
    expect(InteractivePrompts.sendOpsDeclineOrApprovalCompletion).toHaveBeenCalled();

    await trip.destroy();
  });

  it('should run the catchBlock on changeTripStatusToDeclined error ', async () => {
    jest.spyOn(tripService, 'getById')
      .mockRejectedValue(new Error('Dummy error'));
    try {
      await TripActionsController.changeTripStatusToDeclined(opsUserId, payload);
    } catch (err) {
      expect(err).toBeDefined();
    }
  });
});

describe('TripActionController operations approve tests', () => {
  let payload;

  beforeEach(() => {
    payload = {
      user: {
        id: 'TEST123'
      },
      channel: {
        id: 'CE0F7SZNU'
      },
      team: {
        id: 1
      },
      submission: {
        confirmationComment: 'derick has it',
        driverName: 'derick',
        driverPhoneNo: '0700000000',
        regNumber: 'KAA666Q',
        cab: '1, SBARU, KAA666Q',
        driver: 1,
        capacity: '1',
        model: 'ferrari',
        providerId: 1
      },
      state: '{ "tripId": "3", "isAssignProvider": true }'
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const opsUserId = 3;

  it('should change Trip Status for confirmation comment', async () => {
    TeamDetailsService.getTeamDetailsBotOauthToken = jest.fn(() => Promise.resolve('token'));
    const findOrCreateUserBySlackId = jest.spyOn(SlackHelpers,
      'findOrCreateUserBySlackId');
    findOrCreateUserBySlackId.mockImplementation(() => ({
      id: 1
    }));
    const changeTripStatusToConfirmed = jest.spyOn(
      TripActionsController,
      'changeTripStatusToConfirmed'
    );
    changeTripStatusToConfirmed.mockImplementation(() => { });

    await TripActionsController.changeTripStatus(payload);

    expect(findOrCreateUserBySlackId).toHaveBeenCalledTimes(1);
    expect(changeTripStatusToConfirmed).toHaveBeenCalledWith(
      1, payload, 'token'
    );
  });
  it('should run notifiyProvider upon provider assignment', async () => {
    const notifyAll = jest.spyOn(TripActionsController, 'notifyAll').mockResolvedValue({});
    jest.spyOn(tripService, 'updateRequest').mockResolvedValue({ id: 1, name: 'Sample User' });

    await TripActionsController.changeTripStatusToConfirmed(opsUserId, payload, 'token');
    expect(notifyAll).toHaveBeenCalled();
  });

  it('should run the catchBlock on changeTripStatusToConfirmed error ', async () => {
    jest.spyOn(tripService, 'getById')
      .mockRejectedValue(new Error('Dummy error'));
    try {
      await TripActionsController.changeTripStatusToConfirmed(opsUserId, payload,
        'token');
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('should run runCabValidation', () => {
    const validateCabDetailsSpy = jest.spyOn(UserInputValidator,
      'validateCabDetails');
    const result = TripActionsController.runCabValidation(payload);
    expect(validateCabDetailsSpy).toHaveBeenCalledWith(payload);
    expect(result.length).toBe(0);
  });

  it('should run runCabValidation', () => {
    payload.submission.regNumber = '%^&*(';
    const validateCabDetailsSpy = jest.spyOn(UserInputValidator,
      'validateCabDetails');
    const result = TripActionsController.runCabValidation(payload);
    expect(validateCabDetailsSpy).toHaveBeenCalledWith(payload);
    expect(result.length).toBe(1);
  });
  it('should run notifyAll', async () => {
    jest.spyOn(SendNotifications, 'sendManagerConfirmOrDeclineNotification')
      .mockReturnValue();
    jest.spyOn(ProviderNotifications, 'sendTripNotification')
      .mockReturnValue();
    jest.spyOn(InteractivePrompts, 'sendOpsDeclineOrApprovalCompletion')
      .mockResolvedValue();
    await TripActionsController.notifyAll(payload, { rider: { slackId: 'AAA' } }, 'token');
    expect(SendNotifications.sendManagerConfirmOrDeclineNotification).toHaveBeenCalled();
    expect(ProviderNotifications.sendTripNotification).toHaveBeenCalled();
    expect(SendNotifications.sendUserConfirmOrDeclineNotification).toHaveBeenCalled();
    expect(InteractivePrompts.sendOpsDeclineOrApprovalCompletion).toHaveBeenCalled();
  });
  it('Should send notifications to provider and user on trip completion', async () => {
    const cab = { id: 1 };
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('xxop');
    jest.spyOn(cabService, 'findOrCreate').mockResolvedValue(cab);
    jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});
    jest.spyOn(DriverService, 'findOneDriver').mockResolvedValue({ user: { slackId: 'UGD' } });
    jest.spyOn(DriverNotifications, 'checkAndNotifyDriver').mockImplementation(() => jest.fn());

    const updateNotificationSpy = jest.spyOn(ProviderNotifications, 'UpdateProviderNotification').mockResolvedValue({});
    const sendUserNotificationSpy = jest.spyOn(SendNotifications, 'sendUserConfirmOrDeclineNotification');
    await TripActionsController.completeTripRequest(payload);
    expect(updateNotificationSpy).toHaveBeenCalled();
    expect(sendUserNotificationSpy).toHaveBeenCalled();
    expect(DriverNotifications.checkAndNotifyDriver).toBeCalled();
  });

  describe('#getTripNotificationDetails', () => {
    beforeEach(async () => {
      jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId').mockResolvedValue({ id: 'UE1FCCXXX' });
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('xoxb-xxxx-xxxx');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should update trip notification details', async () => {
      const { ops, slackBotOauthToken } = await TripActionsController.getTripNotificationDetails({
        user: { id: 1 }, team: { id: 1 }
      });
      expect(ops.id).toEqual('UE1FCCXXX');
      expect(slackBotOauthToken).toEqual('xoxb-xxxx-xxxx');
      expect(SlackHelpers.findOrCreateUserBySlackId).toHaveBeenCalledTimes(1);
      expect(TeamDetailsService.getTeamDetailsBotOauthToken).toHaveBeenCalledTimes(1);
    });
  });
});
