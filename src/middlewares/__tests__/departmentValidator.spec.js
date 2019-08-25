import DepartmentValidator from '../DepartmentValidator';
import HttpError from '../../helpers/errorHandler';

describe('Department Validator', () => {
  let res;
  let next;
  beforeEach(() => {
    res = {
      status: jest.fn(() => ({
        json: jest.fn()
      })).mockReturnValue({ json: jest.fn() })
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateDeleteProps', () => {
    it('should throw an error when wrong data is sent to validateDeleteProps', (done) => {
      HttpError.sendErrorResponse = jest.fn(() => {});
      DepartmentValidator.validateDeleteProps({ body: {} }, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('validate departmentTrips', () => {
    afterAll(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });
    it('should throw an error when the wrong Startdate is supplied', async () => {
      HttpError.sendErrorResponse = jest.fn(() => {});
      const req = {
        body:
        {
          startDate: '2014',
          endDate: '18-12-14',
          departments: ['people', 'tdd']
        }
      };

      await DepartmentValidator.validateDepartmentTrips(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });
    it('should throw an error when the wrong endDate is supplied', async () => {
      HttpError.sendErrorResponse = jest.fn(() => {});
      const req = {
        body:
        {
          startDate: '2018-11-14',
          endDate: '18',
          departments: ['people', 'tdd']
        }
      };

      await DepartmentValidator.validateDepartmentTrips(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });
    it('should successfully return data when no error is supplied', async () => {
      const req = {
        body:
        {
          startDate: '2018-11-14',
          endDate: '2018-12-25',
          departments: ['people', 'tdd']
        }
      };

      await DepartmentValidator.validateDepartmentTrips(req, res, next);
      expect(next).toBeCalled();
    });
  });

  describe('validate tripType', () => {
    afterAll(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });
    it('should throw an error when the wrong tripType is supplied', async () => {
      HttpError.sendErrorResponse = jest.fn(() => {});
      const req = {
        query:
        {
          tripType: 'Home Visit'
        }
      };
      await DepartmentValidator.validateTripType(req, res, next);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });
    it('should throw no error when correct details are supplied', async () => {
      const req = {
        query:
        {
          tripType: 'Embassy Visit'
        }
      };
      await DepartmentValidator.validateTripType(req, res, next);
      expect(next).toBeCalled();
    });
  });

  describe('validateDepartmentIdQueryParam', () => {
    const req = { params: { id: 'uhg' } };
    it('should throw an error if invalid department id is provided', () => {
      jest.spyOn(HttpError, 'sendErrorResponse');
      DepartmentValidator.validateDepartmentIdQueryParam(req, res, next);
      expect(res.status).toBeCalledWith(400);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'Please provide a positive integer value',
        success: false
      });
    });

    it('should call next if valid department id is provided', () => {
      req.params.id = 1;
      DepartmentValidator.validateDepartmentIdQueryParam(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
