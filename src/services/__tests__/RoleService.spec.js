import RoleService from '../RoleService';
import models from '../../database/models';
import HttpError from '../../helpers/errorHandler';
import UserService from '../UserService';

const { Role, UserRole } = models;

describe('Role Service', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should run createNewRole method and return a role', async () => {
    const findOrCreateMock = jest.spyOn(Role, 'findOrCreate');
    findOrCreateMock.mockResolvedValue(['Basic', true]);

    const result = await RoleService.createNewRole('Ope');
    expect(result).toEqual('Basic');
    expect(findOrCreateMock).toHaveBeenCalledWith({ where: { name: 'Ope' } });
  });

  it('should run createNewRole method and call HttpError method when role already exists',
    async () => {
      const findOrCreateMock = jest.spyOn(Role, 'findOrCreate');
      findOrCreateMock.mockResolvedValue(['Basic', false]);
      const httpMock = jest.spyOn(HttpError, 'throwErrorIfNull').mockImplementation();

      await RoleService.createNewRole('John');
      expect(findOrCreateMock).toHaveBeenCalledWith({ where: { name: 'John' } });
      expect(httpMock).toHaveBeenCalledWith(false, 'Role already exists', 409);
    });

  it('should run createNewRole method and throw an error', async () => {
    const mockErr = new Error('boo');
    const findOrCreateMock = jest.spyOn(Role, 'findOrCreate');
    findOrCreateMock.mockRejectedValue(mockErr);
    const httpMock = jest.spyOn(HttpError, 'throwErrorIfNull');

    expect.assertions(3);
    try {
      await RoleService.createNewRole('John');
    } catch (error) {
      expect(error).toEqual(mockErr);
    }
    expect(findOrCreateMock).toHaveBeenCalledWith({ where: { name: 'John' } });
    expect(httpMock).not.toHaveBeenCalled();
  });

  it('should run getRoles method and return roles', async () => {
    const findAllMock = jest.spyOn(Role, 'all');
    findAllMock.mockResolvedValue('Admin');
    const httpMock = jest.spyOn(HttpError, 'throwErrorIfNull').mockImplementation();

    const result = await RoleService.getRoles();
    expect(result).toEqual('Admin');
    expect(findAllMock).toHaveBeenCalled();
    expect(httpMock).toHaveBeenCalledTimes(1);
    expect(httpMock).toHaveBeenCalledWith('Admin', 'No Existing Roles');
  });

  it('should run getRoles method and throw error', async () => {
    const mockErr = new Error('no roles');
    const findAllMock = jest.spyOn(Role, 'all').mockRejectedValue(mockErr);
    const httpMock = jest.spyOn(HttpError, 'throwErrorIfNull').mockImplementation();

    try {
      await RoleService.getRoles();
    } catch (error) {
      expect(error).toEqual(mockErr);
    }

    expect(findAllMock).toHaveBeenCalled();
    expect(httpMock).toHaveBeenCalledTimes(0);
  });

  it('should run getUserRoles method and return roles', async () => {
    const getUserMock = jest.spyOn(UserService, 'getUser');
    getUserMock.mockResolvedValue({ getRoles: () => ['Editor'] });
    const httpMock = jest.spyOn(HttpError, 'throwErrorIfNull').mockImplementation();

    const result = await RoleService.getUserRoles('tomboy@email.com');

    expect(result).toEqual(['Editor']);
    expect(getUserMock).toHaveBeenCalledWith('tomboy@email.com');
    expect(httpMock).toHaveBeenCalledTimes(1);
    expect(httpMock).toHaveBeenCalledWith('Editor', 'User has no role');
  });

  it('should run getUserRoles method and throw error', async () => {
    const errorMock = new Error('no roles');
    const getUserMock = jest.spyOn(UserService, 'getUser');
    getUserMock.mockRejectedValue(errorMock);
    const httpMock = jest.spyOn(HttpError, 'throwErrorIfNull');

    expect.assertions(3);
    try {
      await RoleService.getUserRoles('tom@email.com');
    } catch (error) {
      expect(error).toEqual(errorMock);
    }

    expect(getUserMock).toHaveBeenCalledWith('tom@email.com');
    expect(httpMock).toHaveBeenCalledTimes(0);
  });


  it('should run getRole method and return roles', async () => {
    const getRoleMock = jest.spyOn(Role, 'find');
    getRoleMock.mockResolvedValue('Sales');
    const httpMock = jest
      .spyOn(HttpError, 'throwErrorIfNull')
      .mockImplementation();

    const result = await RoleService.getRole('Kuyoro');
    expect(result).toEqual('Sales');
    expect(getRoleMock).toHaveBeenCalledWith({ where: { name: 'Kuyoro' } });
    expect(httpMock).toHaveBeenCalledTimes(1);
    expect(httpMock).toHaveBeenCalledWith('Sales', 'Role not found');
  });

  it('should run getRole method and throw error', async () => {
    const errorMock = new Error('Rolex');
    const getRoleMock = jest.spyOn(Role, 'find').mockRejectedValue(errorMock);
    const httpMock = jest
      .spyOn(HttpError, 'throwErrorIfNull')
      .mockImplementation();

    try {
      await RoleService.getRole('Oba');
    } catch (error) {
      expect(error).toEqual(errorMock);
    }

    expect(getRoleMock).toHaveBeenCalledWith({ where: { name: 'Oba' } });
    expect(httpMock).toHaveBeenCalledTimes(0);
  });

  it('should run createUser method and return userRole', async () => {
    const getUserMock = jest.spyOn(UserService, 'getUser')
      .mockResolvedValue({ addRoles: () => ['success'] });
    const getRoleMock = jest.spyOn(RoleService, 'getRole')
      .mockResolvedValue('Executive');

    const httpMock = jest
      .spyOn(HttpError, 'throwErrorIfNull')
      .mockImplementation();

    const result = await RoleService.createUserRole('boss@email.com', 'VIP');

    expect(result).toEqual(['success']);
    expect(getUserMock).toHaveBeenCalledWith('boss@email.com');
    expect(getRoleMock).toHaveBeenCalledWith('VIP');
    expect(httpMock).toHaveBeenCalledTimes(1);
    expect(httpMock).toHaveBeenCalledWith('success', 'This Role is already assigned to this user', 409);
  });

  it('should run createUser method and throw error', async () => {
    const failMock = new Error('Faileddd');
    const getUserMock = jest.spyOn(UserService, 'getUser').mockRejectedValue(failMock);
    const getRoleMock = jest.spyOn(RoleService, 'getRole').mockImplementation();

    const httpMock = jest
      .spyOn(HttpError, 'throwErrorIfNull')
      .mockImplementation();
    try {
      await RoleService.createUserRole('chief@email.com', 'SENATE');
    } catch (error) {
      expect(error).toEqual(failMock);
    }

    expect(getUserMock).toHaveBeenCalledWith('chief@email.com');
    expect(getRoleMock).toHaveBeenCalledTimes(1);
    expect(httpMock).toHaveBeenCalledTimes(0);
  });

  describe('createOrFindRole', () => {
    it('should create new role and return full role object', async () => {
      jest.spyOn(Role, 'findOrCreate').mockResolvedValue({
        id: 1, name: 'Super Admin', createdAt: '2019-01-14 03:00:00+03'
      });
      const role = await RoleService.createOrFindRole('Super Admin');
      expect(role).toEqual({
        id: 1, name: 'Super Admin', createdAt: '2019-01-14 03:00:00+03'
      });
    });
  });

  describe('findUserRoles', () => {
    it('should create new role and return full role object', async () => {
      jest.spyOn(UserRole, 'findAll').mockResolvedValue([]);
      const roles = await RoleService.findUserRoles();
      expect(roles).toEqual([]);
    });
  });

  describe('createUserRoles', () => {
    it('should create new role and return full role object', async () => {
      jest.spyOn(UserRole, 'findOrCreate').mockResolvedValue([]);
      const roles = await RoleService.findOrCreateUserRole(1, 1, 1);
      expect(roles).toEqual([]);
    });
  });
});
