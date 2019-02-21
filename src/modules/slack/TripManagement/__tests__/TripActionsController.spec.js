import TripActionsController from '../TripActionsController';
import SendNotifications from '../../SlackPrompts/Notifications';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import UserInputValidator from '../../../../helpers/slack/UserInputValidator';
import models from '../../../../database/models';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import CabService from '../../../../services/CabService';

const { TripRequest } = models;

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
    jest.spyOn(CabService, 'findOrCreateCab')
      .mockImplementation((driverName, driverPhoneNo, regNumber) => Promise.resolve({
        driverName, driverPhoneNo, regNumber
      }));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should run changeTripToDeclined()', async (done) => {
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
    done();
  });

  it('should go to the changeTripStatus() catch block on error', async (done) => {
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
    done();
  });

  it('should run changeTripStatus() to declinedByOps', async (done) => {
    const trip = await TripRequest.create({
      name: 'A trip',
      riderId: 1,
      tripStatus: 'Approved',
      originId: 1,
      destinationId: 2,
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
    done();
  });

  it('should run the catchBlock on changeTripStatusToDeclined error ', async (done) => {
    jest.spyOn(SlackHelpers, 'getTripRequest').mockRejectedValue(new Error('Dummy error'));
    expect(TripActionsController.changeTripStatusToDeclined(opsUserId, payload))
      .rejects.toThrow(Error);
    done();
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
        regNumber: 'KAA666Q'
      },
      state: '{ "tripId": "3" }'
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const opsUserId = 3;

  it('should change Trip Status for confirmation comment', async (done) => {
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
    done();
  });

  it('should run changeTripStatusToConfirmed() to approvedByOps', async (done) => {
    SendNotifications.sendUserConfirmOrDeclineNotification = jest.fn();
    SendNotifications.sendManagerConfirmOrDeclineNotification = jest.fn();
    await TripActionsController.changeTripStatusToConfirmed(opsUserId,
      payload, 'token');
    expect(SendNotifications.sendUserConfirmOrDeclineNotification).toHaveBeenCalled();
    expect(SendNotifications.sendManagerConfirmOrDeclineNotification).toHaveBeenCalled();
    done();
  });

  it('should run the catchBlock on changeTripStatusToConfirmed error ', async (done) => {
    jest
      .spyOn(SlackHelpers, 'getTripRequest')
      .mockRejectedValue(new Error('Dummy error'));
    try {
      await TripActionsController.changeTripStatusToConfirmed(opsUserId, payload,
        'token');
    } catch (err) {
      expect(err).toBeDefined();
    }
    done();
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
});
