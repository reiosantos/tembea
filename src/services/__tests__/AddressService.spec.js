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
      const mockLocationModel = {
        longitude: 5677,
        latitude: 908998
      };
      const mockAddressModel = {
        dataValues: {
          id: 123,
          address: 'gsg45',
        }
      };
      jest.spyOn(LocationService, 'createLocation')
        .mockResolvedValue(mockLocationModel);
      jest.spyOn(Address, 'findOrCreate')
        .mockResolvedValue([mockAddressModel]);
      const result = await AddressService.createNewAddress(1.0, -1.0, 'Address');
      expect(LocationService.createLocation).toHaveBeenCalledWith(1.0, -1.0);
      expect(Address.findOrCreate).toHaveBeenCalledTimes(1);
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

  describe('findOrCreateAddress', () => {
    beforeEach(() => {
      jest.spyOn(Address, 'findOrCreate').mockImplementation((value) => {
        const id = Math.ceil(Math.random() * 100);
        const newAddress = {
          dataValues: { ...value.defaults, id }
        };
        return [newAddress];
      });

      jest.spyOn(LocationService, 'createLocation').mockImplementation((long, lat) => ({
        id: Math.ceil(Math.random() * 100),
        longitude: long,
        latitude: lat
      }));
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should create a new address with supplied location', async () => {
      const testAddress = {
        address: 'Andela, Nairobi',
        location: {
          longitude: 100,
          latitude: 180
        }
      };

      const result = await AddressService.findOrCreateAddress(
        testAddress.address, testAddress.location
      );

      expect(result.longitude).toEqual(100);
      expect(result.latitude).toEqual(180);
      expect(result.id).toBeDefined();
    });

    it('should not create location when location is not provided', async () => {
      const testAddress = {
        address: 'Andela, Nairobi',
      };
      const result = await AddressService.findOrCreateAddress(testAddress.address);

      expect(result.id).toBeDefined();
      expect(result.longitude).toBeUndefined();
      expect(LocationService.createLocation).toBeCalledTimes(0);
    });
  });
});
