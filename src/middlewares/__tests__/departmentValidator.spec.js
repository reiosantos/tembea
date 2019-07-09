import DepartmentValidator from '../DepartmentValidator';
import HttpError from '../../helpers/errorHandler';
import { response as res } from '../../modules/countries/__mocks__';

describe('Department Validator', () => {
  describe('validateDeleteProps', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });
    it('should throw an error when wrong data is sent to validateDeletePropsValues', (done) => {
      HttpError.sendErrorResponse = jest.fn(() => {});
      DepartmentValidator.validateDeletePropsValues('no', 'no', () => {});
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      done();
    });

    it('should throw an error when wrong data is sent to validateDeleteProps', (done) => {
      HttpError.sendErrorResponse = jest.fn(() => {});
      DepartmentValidator.validateDeleteProps('no', 'no', () => {});
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
      const next = jest.fn();
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
      const next = jest.fn();
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
      const next = jest.fn();
      await DepartmentValidator.validateDepartmentTrips(req, res, next);
      expect(next).toBeCalled();
    });
  });
});
