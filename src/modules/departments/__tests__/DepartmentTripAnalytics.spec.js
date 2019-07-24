import DepartmentService from '../../../services/DepartmentService';
import { departmentAnalytics } from '../__mocks__/addDepartments';
import DepartmentController from '../DepartmentsController';
import { response as res } from '../../countries/__mocks__';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import HttpError from '../../../helpers/errorHandler';
import Response from '../../../helpers/responseHelper';


describe('DepartmentController.fetchDepartmentTrips', () => {
  let req;
  beforeEach(() => {
    req = {
      body: {
        startDate: '2018-11-14',
        endDate: '2018-12-25',
        departments: ['people', 'tdd']
      },
      query: {
        tripType: ''
      }
    };
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should fetch department trip analytics', async () => {
    Response.sendResponse = jest.fn(() => {});
    jest.spyOn(DepartmentService, 'getDepartmentAnalytics')
      .mockResolvedValue(departmentAnalytics);
    await DepartmentController.fetchDepartmentTrips(req, res);
    expect(Response.sendResponse).toBeCalledTimes(1);
  });
  it('Should catch errors', async () => {
    const error = new Error('There is an error flaged');
    jest.spyOn(DepartmentService, 'getDepartmentAnalytics').mockRejectedValue(error);
    jest.spyOn(BugsnagHelper, 'log');
    jest.spyOn(HttpError, 'sendErrorResponse');
    await DepartmentController.fetchDepartmentTrips(req, res);
    expect(BugsnagHelper.log).toBeCalledWith(error);
    expect(HttpError.sendErrorResponse).toBeCalledWith(error, res);
  });
});
