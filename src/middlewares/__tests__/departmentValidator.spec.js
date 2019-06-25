import DepartmentValidator from '../DepartmentValidator';
import HttpError from '../../helpers/errorHandler';

describe('Department Validator', () => {
  let res;
  let next;
  beforeEach(() => {
    res = {
      status: jest.fn(() => ({
        json: jest.fn()
      }))
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
});
