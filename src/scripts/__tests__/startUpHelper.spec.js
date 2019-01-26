import StartUpHelper from '../startUpHelper';
import models from '../../database/models';

const { User, Role } = models;

describe('Super Admin test', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should test createSuperAdmin successfully', async () => {
    const UserFindOrCreateMock = jest.spyOn(User, 'findOrCreate');
    UserFindOrCreateMock.mockResolvedValue([{ addRoles: () => {} }]);

    const RoleFindOrCreateMock = jest.spyOn(Role, 'findOrCreate');
    RoleFindOrCreateMock.mockResolvedValue(['Basic']);

    await StartUpHelper.ensureSuperAdminExists();
    expect(UserFindOrCreateMock).toHaveBeenCalledTimes(1);
    expect(RoleFindOrCreateMock).toHaveBeenCalledTimes(1);
  });

  it('should test createSuperAdmin and throw an error', async () => {
    const mockErr = new Error('boo');
    const UserFindOrCreateMock = jest.spyOn(User, 'findOrCreate').mockRejectedValue(mockErr);

    const RoleFindOrCreateMock = jest.spyOn(Role, 'findOrCreate');
    RoleFindOrCreateMock.mockResolvedValue(['Basic']);

    try {
      await StartUpHelper.ensureSuperAdminExists();
    } catch (error) {
      expect(error).toEqual(mockErr);
    }
    expect(UserFindOrCreateMock).toHaveBeenCalledTimes(1);
    expect(RoleFindOrCreateMock).toHaveBeenCalledTimes(0);
  });
});
