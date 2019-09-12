import RoleManagementController from '../RoleManagementController';
import RoleService from '../../../services/RoleService';
import Response from '../../../helpers/responseHelper';
import HttpError from '../../../helpers/errorHandler';

describe('RoleManagementController Unit Test', () => {
  let sendResponseMock;
  let httpErrorMock;

  beforeEach(() => {
    sendResponseMock = jest.spyOn(Response, 'sendResponse').mockImplementation();
    httpErrorMock = jest.spyOn(HttpError, 'sendErrorResponse').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('newRole method', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call the response method with a success message', async () => {
      const reqMock = { body: { roleName: 'role' } };
      const roleServiceMock = jest.spyOn(RoleService, 'createNewRole').mockResolvedValue('Admin1');

      await RoleManagementController.newRole(reqMock, 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(roleServiceMock).toHaveBeenCalledWith('role');
      expect(sendResponseMock).toHaveBeenCalledTimes(1);
      expect(sendResponseMock).toHaveBeenCalledWith('res', 201, true, 'Role has been created successfully', 'Admin1');
      expect(httpErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should throw error and call HttpError method', async () => {
      const reqMock = { body: { roleName: 'role' } };
      const errMock = new Error('failed');
      const roleServiceMock = jest.spyOn(RoleService, 'createNewRole').mockRejectedValue(errMock);

      await RoleManagementController.newRole(reqMock, 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(roleServiceMock).toHaveBeenCalledWith('role');
      expect(sendResponseMock).toHaveBeenCalledTimes(0);
      expect(httpErrorMock).toHaveBeenCalledTimes(1);
      expect(httpErrorMock).toHaveBeenCalledWith(errMock, 'res');
    });
  });

  describe('readRoles method', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call the response method with a success message', async () => {
      const roleServiceMock = jest.spyOn(RoleService, 'getRoles').mockResolvedValue('Admin');

      await RoleManagementController.readRoles('req', 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(sendResponseMock).toHaveBeenCalledTimes(1);
      expect(sendResponseMock).toHaveBeenCalledWith('res', 200, true, 'All available roles', 'Admin');
      expect(httpErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should throw error and call HttpError method', async () => {
      const errMock = new Error('failed');
      const roleServiceMock = jest.spyOn(RoleService, 'getRoles').mockRejectedValue(errMock);

      await RoleManagementController.readRoles('req', 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(sendResponseMock).toHaveBeenCalledTimes(0);
      expect(httpErrorMock).toHaveBeenCalledTimes(1);
      expect(httpErrorMock).toHaveBeenCalledWith(errMock, 'res');
    });
  });
  describe('readUserRole method', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call the response method with a success message', async () => {
      const reqMock = { query: { email: 'role@email.com' } };
      const roleServiceMock = jest.spyOn(RoleService, 'getUserRoles').mockResolvedValue('Admin');

      await RoleManagementController.readUserRole(reqMock, 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(roleServiceMock).toHaveBeenCalledWith('role@email.com');
      expect(sendResponseMock).toHaveBeenCalledTimes(1);
      expect(sendResponseMock).toHaveBeenCalledWith('res', 200, true, 'User roles', 'Admin');
      expect(httpErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should throw error and call HttpError method', async () => {
      const errMock = new Error('failed');
      const reqMock = { query: { email: 'role@email.com' } };
      const roleServiceMock = jest.spyOn(RoleService, 'getUserRoles').mockRejectedValue(errMock);

      await RoleManagementController.readUserRole(reqMock, 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(roleServiceMock).toHaveBeenCalledWith('role@email.com');
      expect(sendResponseMock).toHaveBeenCalledTimes(0);
      expect(httpErrorMock).toHaveBeenCalledTimes(1);
      expect(httpErrorMock).toHaveBeenCalledWith(errMock, 'res');
    });
  });

  describe('assignRoleToUser method', () => {
    let reqMock;

    beforeEach(() => {
      reqMock = { body: { email: 'role@email.com', roleName: 'Sweeper', homebaseId: 1 } };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call the response method with a success message', async () => {
      const roleServiceMock = jest.spyOn(RoleService, 'createUserRole').mockImplementation();

      await RoleManagementController.assignRoleToUser(reqMock, 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(roleServiceMock).toHaveBeenCalledWith('role@email.com', 'Sweeper', 1);
      expect(sendResponseMock).toHaveBeenCalledTimes(1);
      expect(sendResponseMock).toHaveBeenCalledWith(
        'res', 201, true, 'Role was successfully assigned to the user', ''
      );
      expect(httpErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should throw error and call HttpError method', async () => {
      const errMock = new Error('failed');
      const roleServiceMock = jest.spyOn(RoleService, 'createUserRole').mockRejectedValue(errMock);

      await RoleManagementController.assignRoleToUser(reqMock, 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(roleServiceMock).toHaveBeenCalledWith('role@email.com', 'Sweeper', 1);
      expect(sendResponseMock).toHaveBeenCalledTimes(0);
      expect(httpErrorMock).toHaveBeenCalledTimes(1);
      expect(httpErrorMock).toHaveBeenCalledWith(errMock, 'res');
    });
  });
});
