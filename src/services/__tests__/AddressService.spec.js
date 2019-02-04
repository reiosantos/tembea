import AddressService from '../AddressService';
import models from '../../database/models';
import LocationService from '../LocationService';
import HttpError from '../../helpers/errorHandler';
import { bugsnagHelper } from '../../modules/slack/RouteManagement/rootFile';

const { Address } = models;

describe('AddressService', () => {
  beforeEach(() => {
    jest.spyOn(HttpError, 'throwErrorIfNull').mockReturnValue();
    jest.spyOn(bugsnagHelper, 'log');
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('createNewAddress', () => {
    it('should create new address', async () => {
      const mockLocationModel = { id: 123 };
      const mockAddressModel = { dataValues: {} };
      jest.spyOn(LocationService, 'createLocation')
        .mockResolvedValue(mockLocationModel);
      jest.spyOn(Address, 'create')
        .mockResolvedValue(mockAddressModel);
      const result = await AddressService.createNewAddress(1.0, -1.0, 'Address');
      expect(LocationService.createLocation).toHaveBeenCalledWith(1.0, -1.0);
      expect(Address.create).toHaveBeenCalledWith({ address: 'Address', locationId: 123 });
      expect(result).toEqual({ ...mockAddressModel.dataValues, ...mockLocationModel });
    });
    it('should raise error when having invalid parameters', async () => {
      const mockAddressModel = { dataValues: {} };
      jest.spyOn(LocationService, 'createLocation')
        .mockRejectedValue('Could not create location');
      jest.spyOn(Address, 'create')
        .mockResolvedValue(mockAddressModel);
      await AddressService.createNewAddress(1.0, null, 'Address');
      expect(LocationService.createLocation).toHaveBeenCalledWith(1.0, null);
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(HttpError.throwErrorIfNull)
        .toHaveBeenCalledWith(null, 'Could not create address', 500);
    });
  });

  describe('updateNewAddress', () => {
    it('should update address model', async () => {
      const mockAddressModel = {
        dataValues: { address: '' },
        location: { dataValues: { longitude: -1.0, latitude: 1.0 } },
        save: jest.fn()
      };
      jest.spyOn(AddressService, 'findAddress')
        .mockResolvedValue(mockAddressModel);
      await AddressService.updateAddress('address', -1, 1, 'newAddress');
      expect(mockAddressModel.address).toEqual('newAddress');
      expect(mockAddressModel.location.latitude).toEqual(1);
      expect(mockAddressModel.location.longitude).toEqual(-1);
      expect(mockAddressModel.save).toHaveBeenCalled();
    });
    it('should raise error when having invalid parameters', async () => {
      const mockAddressModel = {
        dataValues: { address: '' },
        location: { dataValues: { longitude: -1.0, latitude: 1.0 } },
        save: jest.fn(() => { throw new Error(); })
      };

      jest.spyOn(AddressService, 'findAddress')
        .mockResolvedValue(mockAddressModel);
      await AddressService.updateAddress('address', -1, 1, 'newAddress');
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(HttpError.throwErrorIfNull)
        .toHaveBeenCalledWith(null, 'Could not update address record', 500);
    });
  });

  describe('findAddress', () => {
    it('should find and return address', async () => {
      const value = { test: 'dummy data' };
      jest.spyOn(Address, 'findOne').mockResolvedValue(value);
      const result = await AddressService.findAddress('');
      expect(result).toEqual(value);
    });
    it('should raise error when having invalid parameters', async () => {
      const value = { test: 'dummy data' };
      jest.spyOn(Address, 'findOne').mockRejectedValue(value);
      await AddressService.findAddress('address');
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(HttpError.throwErrorIfNull)
        .toHaveBeenCalledWith(null, 'Could not find address record', 404);
    });
  });
  describe('getAddressesFromDB', () => {
    it('should return all addresses in the database', async () => {
      const value = [{ test: 'dummy data' }];
      jest.spyOn(Address, 'findAndCountAll')
        .mockResolvedValue(value);
      const result = await AddressService.getAddressesFromDB('');
      expect(result)
        .toEqual(value);
    });
  });
});
