import StartUpHelper from '../startUpHelper';
import models from '../../database/models';
import RoleService from '../../services/RoleService';
import RouteEventHandlers from '../../modules/events/route-event.handlers';

const { User } = models;

describe('Super Admin test', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should test createSuperAdmin successfully', async () => {
    const UserFindOrCreateMock = jest.spyOn(User, 'findOrCreate');
    UserFindOrCreateMock.mockResolvedValue([{ addRoles: () => {} }]);
    jest.spyOn(RoleService, 'findOrCreateUserRole');
    const RoleFindOrCreateMock = jest.spyOn(RoleService, 'createOrFindRole');
    RoleFindOrCreateMock.mockResolvedValue(['Basic']);

    await StartUpHelper.ensureSuperAdminExists();
    expect(RoleService.findOrCreateUserRole).toHaveBeenCalledTimes(2);
    expect(RoleFindOrCreateMock).toHaveBeenCalledTimes(1);
  });

  it('should test getUserNameFromEmail successfully with single name in email', () => {
    const email = 'tembea@gmail.com';
    const userName = StartUpHelper.getUserNameFromEmail(email);
    expect(userName).toEqual('Tembea');
  });

  it('should test getUserNameFromEmail successfully with both names in email', () => {
    const email = 'tembea.devs@gmail.com';
    const userName = StartUpHelper.getUserNameFromEmail(email);
    expect(userName).toEqual('Tembea Devs');
  });

  it('should test createSuperAdmin and throw an error', async () => {
    const mockErr = new Error('boo');
    const UserFindOrCreateMock = jest.spyOn(User, 'findOrCreate').mockRejectedValue(mockErr);

    const RoleFindOrCreateMock = jest.spyOn(RoleService, 'createOrFindRole');
    RoleFindOrCreateMock.mockResolvedValue(['Basic']);

    try {
      await StartUpHelper.ensureSuperAdminExists();
    } catch (error) {
      expect(error).toEqual(mockErr);
    }
    expect(UserFindOrCreateMock).toHaveBeenCalledTimes(2);
    expect(RoleFindOrCreateMock).toHaveBeenCalledTimes(0);
  });
});

describe('StartUpHelper.registerEventHandlers', () => {
  it('should initalize and create subscriptions', async (done) => {
    jest.spyOn(RouteEventHandlers, 'init');
    StartUpHelper.registerEventHandlers();
    expect(RouteEventHandlers.init).toHaveBeenCalledTimes(1);
    expect(RouteEventHandlers.subscriptions.length).toBeGreaterThan(0);
    done();
  });
});
