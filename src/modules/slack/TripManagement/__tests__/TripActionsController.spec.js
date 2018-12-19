import TripActionsController from '../TripActionsController';
import SendNotifications from '../../SlackPrompts/Notifications';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import UserInputValidator from '../../../../helpers/slack/UserInputValidator';
import models from '../../../../database/models';

describe('TripActionController operations decline tests', () => {
  let respond;

  const state = JSON.stringify({ trip: 1000000, actionTs: 212132 });
  const opsUserId = 1;
  let payload;

  beforeEach(() => {
    respond = jest.fn(value => value);
    payload = {
      user: {
        id: 'TEST123'
      },
      channel: {
        id: 'CE0F7SZNU'
      },
      submission: {
        opsDeclineComment: 'abishai has it',
      },
      state
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should run changeTripToDeclined()', async (done) => {
    const findUserByIdOrSlackId = jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId');
    findUserByIdOrSlackId.mockImplementation(() => ({
      id: 1,
    }));
    const changeTripStatusToDeclined = jest.spyOn(TripActionsController, 'changeTripStatusToDeclined');
    changeTripStatusToDeclined.mockImplementation(() => {});

    await TripActionsController.changeTripStatus(payload, respond);

    expect(findUserByIdOrSlackId).toHaveBeenCalledTimes(1);
    expect(changeTripStatusToDeclined).toHaveBeenCalledWith(1, payload, respond);
    done();
  });

  it('should go to the changeTripStatus() catch block on error', async (done) => {
    const findUserByIdOrSlackId = jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId');
    findUserByIdOrSlackId.mockImplementation(() => Promise.reject(new Error()));
    const changeTripStatusToConfirmed = jest.spyOn(TripActionsController, 'changeTripStatusToConfirmed');
    changeTripStatusToConfirmed.mockImplementation(() => {});

    await TripActionsController.changeTripStatus(payload, respond);

    expect(findUserByIdOrSlackId).toHaveBeenCalledTimes(1);
    expect(changeTripStatusToConfirmed).not.toHaveBeenCalled();
    expect(respond).toHaveBeenCalledTimes(1);
    done();
  });

  it('should run changeTripStatus() to declinedByOps', async (done) => {
    const validState = JSON.stringify({ trip: 1, actionTs: 212132 });
    payload.state = validState;
    SendNotifications.sendUserConfirmOrDeclineNotification = jest.fn();
    SendNotifications.sendManagerConfirmOrDeclineNotification = jest.fn();
    InteractivePrompts.sendOpsDeclineOrApprovalCompletion = jest.fn();

    const result = await TripActionsController.changeTripStatusToDeclined(
      opsUserId, payload, respond
    );
    expect(result).toEqual('success');
    expect(SendNotifications.sendUserConfirmOrDeclineNotification).toHaveBeenCalled();
    expect(SendNotifications.sendManagerConfirmOrDeclineNotification).toHaveBeenCalled();
    expect(InteractivePrompts.sendOpsDeclineOrApprovalCompletion).toHaveBeenCalled();

    done();
  });

  it('should run the catchBlock on changeTripStatusToDeclined error ', async (done) => {
    SlackHelpers.getTripRequest = jest.fn(() => Promise.reject(new Error('Dummy error')));
    try {
      await TripActionsController.changeTripStatusToDeclined(opsUserId, payload, respond);
    } catch (error) {
      expect(respond).toHaveBeenCalled();
    }
    done();
  });
});

describe('TripActionController operations approve tests', () => {
  let respond;
  let payload;

  beforeEach(() => {
    respond = jest.fn(value => value);
    payload = {
      user: {
        id: 'TEST123'
      },
      channel: {
        id: 'CE0F7SZNU'
      },
      submission: {
        confirmationComment: 'derick has it',
        driverName: 'derick',
        driverPhoneNo: '0700000000',
        regNumber: 'KAA666Q'
      },
      state: '{ "tripId": "13" }'
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const opsUserId = 3;

  it('should change Trip Status for confirmation comment', async (done) => {
    const findUserByIdOrSlackId = jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId');
    findUserByIdOrSlackId.mockImplementation(() => ({
      id: 1,
    }));
    const changeTripStatusToConfirmed = jest.spyOn(TripActionsController, 'changeTripStatusToConfirmed');
    changeTripStatusToConfirmed.mockImplementation(() => {});

    await TripActionsController.changeTripStatus(payload, respond);

    expect(findUserByIdOrSlackId).toHaveBeenCalledTimes(1);
    expect(changeTripStatusToConfirmed).toHaveBeenCalledWith(1, payload, respond);
    done();
  });

  it('should run changeTripStatusToConfirmed() to approvedByOps', async (done) => {
    SendNotifications.sendUserConfirmNotification = jest.fn();
    SendNotifications.sendManagerConfirmNotification = jest.fn();
    await TripActionsController.changeTripStatusToConfirmed(opsUserId, payload, respond);
    expect(SendNotifications.sendUserConfirmNotification).toHaveBeenCalled();
    expect(SendNotifications.sendManagerConfirmNotification).toHaveBeenCalled();

    done();
  });

  it('should run the catchBlock on changeTripStatusToConfirmed error ', async (done) => {
    SlackHelpers.getTripRequest = jest.fn(() => Promise.reject(new Error('Dummy error')));
    try {
      await TripActionsController.changeTripStatusToConfirmed(opsUserId, payload, respond);
    } catch (error) {
      expect(respond).toHaveBeenCalled();
    }
    done();
  });

  it('should run runCabValidation', () => {
    const validateCabDetailsSpy = jest.spyOn(UserInputValidator, 'validateCabDetails');
    const result = TripActionsController.runCabValidation(payload);
    expect(validateCabDetailsSpy).toHaveBeenCalledWith(payload);
    expect(result.length).toBe(0);
  });

  it('should run runCabValidation', () => {
    payload.submission.regNumber = '%^&*(';
    const validateCabDetailsSpy = jest.spyOn(UserInputValidator, 'validateCabDetails');
    const result = TripActionsController.runCabValidation(payload);
    expect(validateCabDetailsSpy).toHaveBeenCalledWith(payload);
    expect(result.length).toBe(1);
  });

  it('should run the catchBlock on error', async (done) => {
    const { Cab } = models;
    Cab.findOrCreate = jest.fn(() => {
      throw new Error('Dummy error');
    });
    await TripActionsController.addCabDetails(payload, respond);
    expect(respond).toHaveBeenCalled();
    done();
  });
});
