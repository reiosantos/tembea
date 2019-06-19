import StartUpHelper from '../startUpHelper';
import models from '../../database/models';
import RoleService from '../../services/RoleService';
import LocationService from '../../services/LocationService';
import { DEFAULT_ADDRESSES } from '../../helpers/constants';

const { User, Address } = models;

describe('Super Admin test', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should test createSuperAdmin successfully', async () => {
    const UserFindOrCreateMock = jest.spyOn(User, 'findOrCreate');
    UserFindOrCreateMock.mockResolvedValue([{ addRoles: () => {} }]);

    const RoleFindOrCreateMock = jest.spyOn(RoleService, 'createOrFindRole');
    RoleFindOrCreateMock.mockResolvedValue(['Basic']);

    await StartUpHelper.ensureSuperAdminExists();
    expect(UserFindOrCreateMock).toHaveBeenCalledTimes(2);
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

describe('StartUpHelper.addDefaultAddresses', () => {
  const mockLocationData = {
    dataValues: { locationId: 1 },
    update: jest.fn()
  };
  const totalAddresses = DEFAULT_ADDRESSES.length;

  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should ensure that default location are preloaded if not existing', async () => {
    jest.spyOn(LocationService, 'createLocation').mockResolvedValue(mockLocationData);
    jest.spyOn(Address, 'create').mockResolvedValue(mockLocationData);
    jest.spyOn(Address, 'findOne').mockResolvedValue(null);

    await StartUpHelper.addDefaultAddresses();
    expect(mockLocationData.update).toHaveBeenCalledTimes(0);
    expect(Address.create).toHaveBeenCalledTimes(totalAddresses);
  });
  it('should ensure that default location are not preloaded if already existing', async () => {
    jest.spyOn(LocationService, 'createLocation').mockResolvedValue(mockLocationData);
    jest.spyOn(Address, 'findOne').mockResolvedValue(mockLocationData);
    jest.spyOn(Address, 'create');

    await StartUpHelper.addDefaultAddresses();
    expect(Address.create).toHaveBeenCalledTimes(0);
    expect(mockLocationData.update).toHaveBeenCalledTimes(totalAddresses);
  });
});
