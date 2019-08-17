import AuthenticationController from '../AuthenticationController';
import Response from '../../../helpers/responseHelper';
import HttpError from '../../../helpers/errorHandler';
import Utils from '../../../utils';
import RoleService from '../../../services/RoleService';
import UserService from '../../../services/UserService';
import RolesHelper from '../../../helpers/RolesHelper';

describe('AuthenticationController Unit Test', () => {
  let sendResponseMock;
  let httpErrorMock;

  beforeEach(() => {
    sendResponseMock = jest.spyOn(Response, 'sendResponse').mockImplementation();
    httpErrorMock = jest.spyOn(HttpError, 'sendErrorResponse').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Verify User method', () => {
    let reqMock;

    beforeEach(() => {
      reqMock = { currentUser: { UserInfo: { email: 'boy@email.com' } } };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call the response method with success message', async () => {
      const roleServiceMock = jest.spyOn(RoleService, 'getUserRoles').mockResolvedValue(['Admin']);
      const utilsMock = jest.spyOn(Utils, 'mapThroughArrayOfObjectsByKey')
        .mockReturnValue('user');
      jest.spyOn(UserService, 'getUserByEmail').mockReturnValue({ id: 1 });
      jest.spyOn(RoleService, 'findUserRoles').mockReturnValue([]);
      jest.spyOn(RolesHelper, 'mapLocationsAndRoles').mockReturnValue({});
      await AuthenticationController.verifyUser(reqMock, 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(roleServiceMock).toHaveBeenCalledWith('boy@email.com');
      expect(utilsMock).toHaveBeenCalledTimes(1);
      expect(utilsMock).toHaveBeenCalledWith(['Admin'], 'name');
      expect(sendResponseMock).toHaveBeenCalledTimes(1);
      expect(httpErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should throw error and call HttpError method', async () => {
      const errMock = new Error('failed');
      const roleServiceMock = jest.spyOn(RoleService, 'getUserRoles').mockRejectedValue(errMock);
      const utilsMock = jest.spyOn(Utils, 'mapThroughArrayOfObjectsByKey')
        .mockImplementation();

      await AuthenticationController.verifyUser(reqMock, 'res');
      expect(roleServiceMock).toHaveBeenCalledTimes(1);
      expect(roleServiceMock).toHaveBeenCalledWith('boy@email.com');
      expect(utilsMock).toHaveBeenCalledTimes(0);
      expect(sendResponseMock).toHaveBeenCalledTimes(0);
      expect(httpErrorMock).toHaveBeenCalledTimes(1);
      expect(httpErrorMock).toHaveBeenCalledWith(errMock, 'res');
    });
  });
});
