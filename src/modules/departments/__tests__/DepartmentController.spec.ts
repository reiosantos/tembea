import DepartmentsController from '../DepartmentsController';
import UserService from '../../../services/UserService';
import DepartmentService from '../../../services/DepartmentService';
import TeamDetailsService from '../../../services/TeamDetailsService';
import errorHandler from '../../../helpers/errorHandler';

describe('DepartmentControllers', () => {
  let req: any;
  let res: any;
  let departmentControllerSpy: any;
  let userSpy: any;
  let teamServiceSpy: any;

  beforeEach(() => {
    departmentControllerSpy = jest.spyOn(DepartmentsController, 'isValidDepartmentHomeBase');
    userSpy = jest.spyOn(UserService, 'getUserById');
    teamServiceSpy = jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl');
    res = {
      status: jest.fn(() => ({
        json: jest.fn(),
      })).mockReturnValue({ json: jest.fn() }),
    };
    req = {
      body: {
        name: 'Updated Department',
        headId: 1,
        homebaseId: 1,
      },
      params: { id: 1 },
    };
  });
  describe('DepartmentsController.updateDepartments', () => {
    it('should validate Location Existence', async () => {
      const response = { success: false, message: 'No HomeBase exists with provided homebaseId' };
      departmentControllerSpy.mockReturnValue(null);
      await DepartmentsController.validateLocationExistence(req, res);
      expect(res.status).toBeCalledWith(400);
      expect(res.status().json).toBeCalledWith(response);
    });
    it('should validate head Existence', async () => {
      const response = {
        success: false,
        message: 'Department Head with headId 1 does not exists',
      };
      userSpy.mockReturnValue(null);
      await DepartmentsController.validateHeadExistence(req, res);
      expect(res.status).toBeCalledWith(404);
      expect(res.status().json).toHaveBeenCalledWith(response);
    });

    it('should update Department successfully', async () => {
      const response = {
        success: true,
        message: 'Department record updated',
        department: {},
      };
      jest.spyOn(DepartmentsController, 'validateLocationExistence').mockReturnValue(null);
      jest.spyOn(DepartmentsController, 'validateHeadExistence').mockReturnValue(null);
      jest.spyOn(DepartmentService, 'updateDepartment').mockReturnValue({});
      await DepartmentsController.updateDepartment(req, res);
      expect(res.status).toBeCalled();
      expect(res.status().json).toBeCalledWith(response);
    });
  });

  describe('DepartmentControllers.addDepartment', () => {
    req = {
      email: 'test@test.com',
      name: 'TDD',
      slackUrl: 'Andela.slack.com',
      homebaseId: 1,
    };
    userSpy = jest.spyOn(UserService, 'getUser').mockReturnValue({});
    it('should create department successfully', async () => {
      jest.spyOn(DepartmentService, 'createDepartment').mockReturnValue([{}, true]);
      jest.spyOn(DepartmentsController, 'returnCreateDepartmentResponse');
      jest.spyOn(DepartmentsController, 'validateLocationExistence').mockReturnValue(null);
      teamServiceSpy.mockReturnValue({ teamId: 1 });
      await DepartmentsController.addDepartment(req, res);
      expect(DepartmentsController.returnCreateDepartmentResponse).toBeCalled();
    });

    it('should return error on failure to create department', async () => {
      const error = new Error('Something went wrong');
      jest.spyOn(DepartmentService, 'createDepartment').mockRejectedValue(error);
      jest.spyOn(errorHandler, 'sendErrorResponse');
      await DepartmentsController.addDepartment(req, res);
      expect(errorHandler.sendErrorResponse).toBeCalled();
    });
  });
});
