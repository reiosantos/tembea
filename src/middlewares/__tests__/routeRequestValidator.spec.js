import RouteRequestValidator from '../RouteRequestValidator';

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
          routeId: 1
        },
        body: {
          newOpsStatus: 'decline',
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
          routeId: 1
        },
        body: {
          newOpsStatus: 'approve',
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

    it('should call the next middleware if the params are valid', () => {
      const req = {
        params: {
          routeId: 1
        },
        body: {
          newOpsStatus: 'decline',
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

    it('should validate request body for approval request', () => {
      const req = {
        params: {
          requestId: 1
        },
        body: {
          newOpsStatus: 'approve',
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
