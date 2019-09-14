/* eslint-disable no-useless-escape */
import TripValidator from '../TripValidator';
import HttpError from '../../helpers/errorHandler';
import tripService, { TripService } from '../../services/TripService';
import { tripRequestDetails } from '../../modules/slack/SlackInteractions/__mocks__/SlackInteractions.mock';
import Response from '../../helpers/responseHelper';
import JoiHelper from '../../helpers/JoiHelper';

describe('Trip Validator', () => {
  let req;
  let reqDecline;
  let res;
  let next;
  let resolved;

  beforeEach(() => {
    req = {
      body: {
        comment: 'ns',
        slackUrl: 'sokoolworkspace.slack.com',
        providerId: 1
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
      jest.spyOn(tripService, 'getById').mockResolvedValue(tripRequestDetails);
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
    it('should fail if action is decline and providerId is supplied', async () => {
      req.query.action = 'decline';
      HttpError.sendErrorResponse = jest.fn(() => { });
      jest.spyOn(HttpError, 'sendErrorResponse')
        .mockResolvedValue(resolved);
      jest.spyOn(TripService, 'checkExistence')
        .mockResolvedValue(true);

      await TripValidator.validateAll(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(0);
    });
    it('should call next middleware if providerId is not supplied and action is decline',
      async () => {
        req.query.action = 'decline';
        delete req.body.providerId;
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
    it('should call validateAll with missing tripId ', async () => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      req.params.tripId = null;
      req.body.providerId = 1;
      jest.spyOn(HttpError, 'sendErrorResponse');
      jest.spyOn(TripService, 'checkExistence').mockResolvedValue(true);

      await TripValidator.validateAll(req, res, next).then(() => {
        expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
        expect(HttpError.sendErrorResponse)
          .toHaveBeenCalledWith({
            message: {
              errorMessage: 'Validation error occurred, see error object for details',
              tripId: 'tripId should be a number',
            },
            statusCode: 400
          }, res);
      });
    });

    it('should call next middleware', async () => {
      jest.spyOn(TripService, 'checkExistence').mockResolvedValueOnce(true);
      const reqq = { ...req };
      reqq.params.tripId = 1;
      reqq.body.providerId = 1;
      await TripValidator.validateAll(reqq, res, next);
      expect(next).toHaveBeenCalledTimes(1);
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
      TripValidator.validateAll(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(0);
      done();
    });

    it('should call validateAll with invalid driverPhoneNo ', (done) => {
      req.body.driverPhoneNo = 'sdd';
      HttpError.sendErrorResponse = jest.fn(() => { });
      resolved = ['Invalid phone number!'];
      jest.spyOn(TripService, 'checkExistence').mockResolvedValue(true);
      jest.spyOn(JoiHelper, 'validateSubmission')
        .mockResolvedValue(resolved);

      TripValidator.validateAll(req, res, next).then(() => {
        expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
        expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({ message: resolved }, res);
        expect(next).toHaveBeenCalledTimes(0);
      });
      done();
    });
    it('should call validateAll with invalid tripId ', (done) => {
      HttpError.sendErrorResponse = jest.fn(() => { });
      req.params.tripId = 'we';
      jest.spyOn(TripService, 'checkExistence').mockResolvedValue(true);
      jest.spyOn(HttpError, 'sendErrorResponse');

      TripValidator.validateAll(req, res, next).then(() => {
        expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
        expect(HttpError.sendErrorResponse).toHaveBeenCalledWith({
          message: {
            errorMessage: 'Validation error occurred, see error object for details',
            tripId: 'tripId should be a number'
          },
          statusCode: 400
        }, res);
      });
      done();
    });
  });

  describe('validate query params', () => {
    let validationErrorResponse;
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
      req = { query: {} };
      TripValidator.validateGetTripsParam(req, res, next);
      expect(statusMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });

    describe('status', () => {
      it('valid status provided', () => {
        req = { query: { status: 'Confirmed' } };
        TripValidator.validateGetTripsParam(req, res, next);
        expect(statusMock).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
      });
      it('invalid status provided', () => {
        req = { query: { status: 'Unknown' } };
        TripValidator.validateGetTripsParam(req, res, next);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('Date', () => {
      it('validate \'after\' date is valid', () => {
        req = { query: { departureTime: 'after:2018-01-01' } };
        TripValidator.validateGetTripsParam(req, res, next);
        expect(statusMock).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
      });
      it('validate \'before\' date is valid', () => {
        req = { query: { departureTime: 'before:2018-01-01' } };
        TripValidator.validateGetTripsParam(req, res, next);
        expect(statusMock).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
      });
      it('validate \'before\' & \'after\' date is valid', () => {
        req = { query: { departureTime: 'before:2018-01-01;after:2017-10-10' } };
        TripValidator.validateGetTripsParam(req, res, next);
        expect(statusMock).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
      });
      it('validate \'before\' date is invalid', () => {
        req = { query: { requestedOn: 'before:2019-02-30' } };
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
        req = { query: { requestedOn: 'after:2019-02-30' } };
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
        req = { query: { departureTime: 'invalid:2019-02-10;after:2020-02-10' } };
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
        req = { query: { requestedOn: 'before:2019-02-10;after:2020-02-10' } };
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
});


describe('Travel Trip Validator', () => {
  const req = { body: {} };
  let res;
  let next;

  beforeEach(() => {
    jest.spyOn(Response, 'sendResponse');
    jest.spyOn(HttpError, 'sendErrorResponse');

    next = jest.fn();

    res = {
      status: jest.fn(() => ({ json: jest.fn() })),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should validate the request body', async () => {
    await TripValidator.validateTravelTrip(req, res, next);
    expect(HttpError.sendErrorResponse).toHaveBeenCalled();
  });

  it('should call next it no errors are found', async () => {
    req.body = {
      startDate: '2016-11-15 03:00',
      endDate: '2018-11-15 03:00',
      departmentList: [' people ', ' TDD ']
    };
    await TripValidator.validateTravelTrip(req, res, next);
    expect(req.body.departmentList[1]).toBe('TDD');
    expect(req.body.departmentList[0]).toBe('people');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
