import RouteRequestValidator from '../RouteRequestValidator';
import RouteRequestService from '../../services/RouteRequestService';
import HttpError from '../../helpers/errorHandler';

describe('RouteRequestValidator', () => {
  describe('validateParams', () => {
    const res = {
      status: () => ({
        json: () => {}
      })
    };
    const next = jest.fn();

    beforeEach(() => {
      jest.spyOn(res, 'status');
    });

    it('should return 400 when requestId is not a number', () => {
      const req = {
        params: {
          requestId: 'sd'
        }
      };

      RouteRequestValidator.validateParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 400 when the newOpsStatus is invalid', () => {
      const req = {
        params: {
          requestId: 1,
        },
        body: {
          newOpsStatus: 'decliner'
        }
      };

      RouteRequestValidator.validateParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 400 if comment has a forbidden character', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'decline',
          reviewerId: ' 2',
          comment: 'some = comment'
        }
      };

      RouteRequestValidator.validateParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 400 if reviewerEmail is invalid', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'decline',
          reviewerEmail: 'ope@slack.com',
          comment: 'some comment'
        }
      };

      RouteRequestValidator.validateParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should respond with invalid slackURL', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'decline',
          reviewerEmail: 'test@andela.com',
          comment: 'some comment',
          teamUrl: 'stuffslack.com'
        }
      };

      RouteRequestValidator.validateParams(req, res, next);
      jest.spyOn(RouteRequestValidator, 'sendResponse');

      RouteRequestValidator.validateParams(req, res, next);
      expect(next).toHaveBeenCalledTimes(0);
      expect(RouteRequestValidator.sendResponse).toHaveBeenCalledWith(res, 'teamUrl must be in the format "*.slack.com"');
    });

    it('should call validateApprovalBody', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'approve',
          reviewerEmail: 'test@andela.com',
          comment: 'some comment',
          teamUrl: 'stuff.slack.com',
          routeName: 'sample route',
          takeOff: '10:00',
          provider: 'Uber Kenya'
        }
      };
      jest.spyOn(RouteRequestValidator, 'validateApprovalBody');

      RouteRequestValidator.validateParams(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(RouteRequestValidator.validateApprovalBody).toHaveBeenCalledWith(req, res, next);
    });

    it('should call the next middleware the params are valid', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'decline',
          reviewerEmail: 'test@andela.com',
          comment: 'some comment',
          teamUrl: 'stuff.slack.com'
        }
      };

      RouteRequestValidator.validateParams(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
  describe('validateRequestBody', () => {
    const res = {
      status: () => ({
        json: () => {}
      })
    };
    const next = jest.fn();

    beforeEach(() => {
      jest.spyOn(res, 'status');
    });

    it('should respond with a 400 status code when some properties are missing', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          comment: 'some comment'
        }
      };

      RouteRequestValidator.validateRequestBody(req, res, next);

      expect(res.status).toBeCalledWith(400);
    });

    it('should call next middleware if checks passed', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'decline',
          reviewerEmail: 'test@andela.com',
          comment: 'some comment',
          teamUrl: 'tembea.slack.com',
          routeName: 'sample route',
          takeOff: '10:00',
          provider: 'Uber Kenya'
        }
      };

      RouteRequestValidator.validateRequestBody(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
  describe('validateRoute', () => {
    const res = {
      status: () => ({
        json: () => {}
      })
    };
    const req = {
      params: {
        requestId: 1,
        newOpsStatus: 'decline'
      }
    };
    const next = jest.fn();

    beforeEach(() => {
      jest.spyOn(res, 'status');
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation();
    });

    it('should call getRouteRequest with id of 1', async () => {
      await RouteRequestValidator.validateRouteStatus(req, res, next);

      expect(RouteRequestService.getRouteRequest).toHaveBeenCalledWith(1);
    });

    it('should respond with 409 if route has been approved', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        status: 'Approved'
      }));

      await RouteRequestValidator.validateRouteStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should respond with 409 if route has been declined', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        status: 'Declined'
      }));

      await RouteRequestValidator.validateRouteStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should respond with 403 if route has been confirmed', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        status: 'Pending'
      }));

      await RouteRequestValidator.validateRouteStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should call the next middleware if no error was found', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        status: 'Confirmed'
      }));

      await RouteRequestValidator.validateRouteStatus(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle error successfully', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => {
        throw new Error('Just a test error');
      });
      jest.spyOn(HttpError, 'sendErrorResponse').mockImplementation();

      await RouteRequestValidator.validateRouteStatus(req, res, next);

      expect(HttpError.sendErrorResponse).toHaveBeenCalled();
    });
  });
  describe('validateApprovalBody', () => {
    const res = {
      status: () => ({
        json: () => {}
      })
    };
    const next = jest.fn();

    it('should respond with a 400 if incomplete parameters are sent', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'approve',
          comment: 'stuff',
          reviewerId: '2',
          takeOff: '10--00'
        }
      };
      jest.spyOn(res, 'status');
      RouteRequestValidator.validateApprovalBody(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should ensure takeOff time is correct', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'approve',
          comment: 'stuff',
          reviewerId: '2',
          routeName: 'Yaba',
          capacity: '2',
          takeOff: '1900',
          teamUrl: 'stuff.slack.com',
          provider: {}
        }
      };
      jest.spyOn(RouteRequestValidator, 'sendResponse');

      RouteRequestValidator.validateApprovalBody(req, res, next);
      expect(RouteRequestValidator.sendResponse).toHaveBeenCalledWith(
        res, 'Take off time must be in the right format e.g 11:30'
      );
    });

    it('should call the next middleware', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'approve',
          comment: 'stuff',
          reviewerId: '2',
          routeName: 'Yaba',
          capacity: '2',
          takeOff: '19:00',
          provider: {}
        }
      };

      RouteRequestValidator.validateApprovalBody(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
