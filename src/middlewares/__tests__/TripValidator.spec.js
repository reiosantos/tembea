import TripValidator from '../TripValidator';
import HttpError from '../../helpers/errorHandler';
import GeneralValidator from '../GeneralValidator';
import { TripService } from '../../services/TripService';

describe('Trip Validator', () => {
  let req;
  let reqDecline;
  let res;
  let next;
  let resolved;

  beforeEach(() => {
    req = {
      body: {
        driverPhoneNo: '0777777777',
        driverName: 'nnn',
        regNumber: 'lmnbv',
        capacity: '8',
        model: 'ferrari',
        comment: 'ns',
        slackUrl: 'sokoolworkspace.slack.com',
        userEmail: 'paul.soko@andela.com'
      },
      params: { tripId: 15 },
      status: 200,
      query: { action: 'confirm' }
    };
    reqDecline = {
      body: {
        comment: 'ns',
        slackUrl: 'sokoolworkspace.slack.com'
      },
      params: { tripId: 15 },
      status: 200,
      query: { action: 'decline' }
    };
    res = {
      status: jest
        .fn(() => ({
          json: jest.fn(() => { })
        }))
        .mockReturnValue({ json: jest.fn() })
    };
    next = jest.fn();
  });


  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateAll method', () => {
    beforeEach(() => {
      resolved = {
        success: false,
        message: 'Some properties are missing for approval',
        errors: [
          'Please provide driverPhoneNo.'
        ]
      };
    });
    it('should call validateAll with all values for confirm with non existing trip', async () => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(TripService, 'checkExistence')
        .mockResolvedValue(false);

      await TripValidator.validateAll(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(0);
    });
    it('should call validateAll with all values for confirm', async () => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(TripService, 'checkExistence')
        .mockResolvedValue(true);

      await TripValidator.validateAll(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(0);
      expect(next).toHaveBeenCalledTimes(1);
    });
    it('should call validateAll with all values for decline', async () => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(TripService, 'checkExistence')
        .mockResolvedValue(true);

      await TripValidator.validateAll(reqDecline, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(0);
      expect(next).toHaveBeenCalledTimes(1);
    });
    it('should call validateAll with missing driverPhoneNo ', async () => {
      req.body.driverPhoneNo = null;
      HttpError.sendErrorResponse = jest.fn(() => { });
      resolved.errors[0] = 'Please provide driverPhoneNo.';
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(TripService, 'checkExistence')
        .mockResolvedValue(true);

      await TripValidator.validateAll(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({ message: ['Please provide driverPhoneNo.'] }, res);
      expect(next).toHaveBeenCalledTimes(0);
    });
    it('should call validateAll with missing tripId ', async () => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      req.params.tripId = null;
      resolved.errors[0] = 'Add tripId to the url';
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(TripService, 'checkExistence')
        .mockResolvedValue(true);

      await TripValidator.validateAll(req, res, next).then(() => {
        expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
        expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({ message: ['Add tripId to the url'] }, res);
      });
    });
  });
  describe('validateEachInput method', () => {
    beforeEach(() => {
      resolved = {
        success: false,
        message: 'Some properties are not valid',
        errors: [
          {
            name: 'slackUrl',
            error: 'Invalid slackUrl. e.g: ACME.slack.com'
          }
        ]
      };
    });
    it('should call validateAll with all values ', (done) => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);

      TripValidator.validateEachInput(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(0);
      expect(next).toHaveBeenCalledTimes(1);
      done();
    });
    it('should call validateAll with invalid driverPhoneNo ', (done) => {
      req.body.driverPhoneNo = 'sdd';
      HttpError.sendErrorResponse = jest.fn(() => { });
      resolved.errors[0] = { error: 'Invalid phone number!', name: 'driverPhoneNo' };
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);

      TripValidator.validateEachInput(req, res, next).then(() => {
        expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
        expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({ message: resolved.errors }, res);
        expect(next).toHaveBeenCalledTimes(0);
      });
      done();
    });
    it('should call validateAll with invalid tripId ', (done) => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      req.params.tripId = 'we';
      resolved.errors[0] = { error: 'Invalid tripId in the url it must be a number. eg: api/v1/trips/12/confirm', name: 'tripId' };
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);

      TripValidator.validateEachInput(req, res, next).then(() => {
        expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
        expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({ message: resolved.errors }, res);
      });
      done();
    });
    it('should call validateAll with invalid slackUrl ', (done) => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      req.body.slackUrl = 'sokoolworkspaceslack.com';
      resolved.errors[0] = {
        name: 'slackUrl',
        error: 'Invalid slackUrl. e.g: ACME.slack.com'
      };
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(GeneralValidator, 'validateTeamUrl')
        .mockReturnValue(false);

      TripValidator.validateEachInput(req, res, next).then(() => {
        expect(GeneralValidator.validateTeamUrl).toHaveBeenCalledTimes(1);
        expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({ message: resolved.errors }, res);
      });
      done();
    });
    it('should call validateAll with invalid userEmail', (done) => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      req.body.userEmail = 'paul.com';
      req.body.slackUrl = 'sokoolworkspace.slack.com';
      resolved.errors[0] = {
        name: 'userEmail',
        error: 'Invalid userEmail.'
      };
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(GeneralValidator, 'validateTeamUrl')
        .mockReturnValue(true);

      TripValidator.validateEachInput(req, res, next);
      expect(GeneralValidator.validateTeamUrl).toHaveBeenCalledTimes(1);
      done();
    });
  });
});

describe('validate query params', () => {
  let validationErrorResponse;
  let res;
  let next;
  let jsonMock;
  let statusMock;
  beforeEach(() => {
    validationErrorResponse = {
      success: false,
      message: 'Validation Error',
      data: null
    };
    jsonMock = jest.fn();
    statusMock = jest.fn().mockImplementation(() => ({ json: jsonMock }));
    res = {
      status: statusMock
    };
    next = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('validate that query parameters are options', () => {
    const req = { query: {} };
    TripValidator.validateGetTripsParam(req, res, next);
    expect(statusMock).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  describe('status', () => {
    it('valid status provided', () => {
      const req = { query: { status: 'Confirmed' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
    it('invalid status provided', () => {
      const req = { query: { status: 'Unknown' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).toHaveBeenCalledWith(400);
      validationErrorResponse.data = {
        errors: ['Status can be either \'Approved\', \'Confirmed\' , \'Pending\',  \' Completed\', '
        + '\'DeclinedByManager\', \'DeclinedByOps\', \'InTransit\' or \'Cancelled\'']
      };
      expect(jsonMock).toHaveBeenCalledWith(validationErrorResponse);
      expect(next).not.toHaveBeenCalled();
    });
  });
  describe('Date', () => {
    it('validate \'after\' date is valid', () => {
      const req = { query: { departureTime: 'after:2018-01-01' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
    it('validate \'before\' date is valid', () => {
      const req = { query: { departureTime: 'before:2018-01-01' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
    it('validate \'before\' & \'after\' date is valid', () => {
      const req = { query: { departureTime: 'before:2018-01-01;after:2017-10-10' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });
    it('validate \'before\' date is invalid', () => {
      const req = { query: { requestedOn: 'before:2019-02-30' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).toHaveBeenCalledWith(400);
      validationErrorResponse.data = {
        errors: [
          'requestedOn \'before\' date is not valid. It should be in the format \'YYYY-MM-DD\''
        ]
      };
      expect(jsonMock).toHaveBeenCalledWith(validationErrorResponse);
      expect(next).not.toHaveBeenCalled();
    });
    it('validate \'after\' date is invalid', () => {
      const req = { query: { requestedOn: 'after:2019-02-30' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).toHaveBeenCalledWith(400);
      validationErrorResponse.data = {
        errors: [
          'requestedOn \'after\' date is not valid. It should be in the format \'YYYY-MM-DD\''
        ]
      };
      expect(jsonMock).toHaveBeenCalledWith(validationErrorResponse);
      expect(next).not.toHaveBeenCalled();
    });
    it('should validate departureTime input format is valid', () => {
      const req = { query: { departureTime: 'invalid:2019-02-10;after:2020-02-10' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).toHaveBeenCalledWith(400);
      validationErrorResponse.data = {
        errors: [
          'Invalid format, departureTime must be in the format '
          + 'departureTime=before:YYYY-MM-DD;after:YYYY-MM-DD'
        ]
      };
      expect(jsonMock).toHaveBeenCalledWith(validationErrorResponse);
      expect(next).not.toHaveBeenCalled();
    });
    it('should validate \'after\' date is great than \'before\'', () => {
      const req = { query: { requestedOn: 'before:2019-02-10;after:2020-02-10' } };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).toHaveBeenCalledWith(400);
      validationErrorResponse.data = {
        errors: ['requestedOn \'before\' date cannot be less than \'after\' date']
      };
      expect(jsonMock).toHaveBeenCalledWith(validationErrorResponse);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
