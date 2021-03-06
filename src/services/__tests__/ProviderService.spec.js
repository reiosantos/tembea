import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import ProviderHelper from '../../helpers/providerHelper';
import ProviderService, { providerService } from '../ProviderService';
import UserService from '../UserService';
import {
  mockGetCabsData,
  mockReturnedProvider,
  mockCreatedProvider, mockProviderRecord, mockCabsData, mockDriversData
} from '../__mocks__';
import database from '../../database';

const { models: { Provider } } = database;
jest.mock('../../helpers/sequelizePaginationHelper', () => jest.fn());


describe('ProviderService', () => {
  describe('getProviders', () => {
    beforeEach(() => {
      SequelizePaginationHelper.mockClear();
      ProviderHelper.serializeDetails = jest.fn();
    });

    it('returns a list of providers', async () => {
      const getPageItems = jest.fn()
        .mockResolvedValue(mockGetCabsData);
      SequelizePaginationHelper.mockImplementation(() => ({
        getPageItems
      }));
      await ProviderService.getProviders({
        page: 1,
        size: 10,
      });
      expect(SequelizePaginationHelper).toHaveBeenCalled();
      expect(getPageItems).toHaveBeenCalledWith(1);
      expect(ProviderHelper.serializeDetails).toHaveBeenCalled();
    });

    it('returns a list of providers when the page able parameter is not passed', async () => {
      const getPageItems = jest.fn()
        .mockResolvedValue(mockGetCabsData);
      SequelizePaginationHelper.mockImplementation(() => ({
        getPageItems
      }));
      await ProviderService.getProviders();
      expect(SequelizePaginationHelper).toHaveBeenCalled();
      expect(getPageItems).toHaveBeenCalledWith(1);
      expect(ProviderHelper.serializeDetails).toHaveBeenCalled();
    });

    it('returns a list of providers when page <= totalPages', async () => {
      const getPageItems = jest.fn()
        .mockResolvedValue(mockGetCabsData);
      SequelizePaginationHelper.mockImplementation(() => ({
        getPageItems
      }));
      await ProviderService.getProviders({
        page: 2,
        size: 10,
      });
      expect(SequelizePaginationHelper).toHaveBeenCalled();
      expect(getPageItems).toHaveBeenCalledWith(2);
    });
  });

  describe('createProvider', () => {
    beforeEach(() => {
      jest.spyOn(Provider, 'findOrCreate').mockResolvedValue(mockCreatedProvider);
    });
    it('test createProvider', async () => {
      const result = await ProviderService.createProvider({
        name: 'Uber Kenya', providerUserId: 3
      });
      expect(Provider.findOrCreate).toHaveBeenCalled();
      expect(result).toEqual(mockReturnedProvider);
    });
    describe('ProviderService', () => {
      it('should delete a provider successfully', async () => {
        Provider.destroy = jest.fn(() => 1);
        const result = await ProviderService.deleteProvider(1);
        expect(result).toEqual(1);
      });

      it('should return zero for unexisting data', async () => {
        Provider.destroy = jest.fn(() => 0);

        const result = await ProviderService.deleteProvider(1);
        expect(result).toEqual(0);
      });
    });

    describe('Update Provider', () => {
      let mockProviderUpdateData;
      beforeEach(() => {
        mockProviderUpdateData = {
          email: 'fakeEmail@andela.com',
          name: 'Fake Provider'
        };
      });

      it('should update provider details successfully', async () => {
        const mockData = [1, [{ name: 'Uber Uganda' }]];
        jest.spyOn(UserService, 'getUserByEmail')
          .mockReturnValue({
            dataValues: { id: 1 }
          });
        jest.spyOn(ProviderService, 'updateProvider').mockReturnValueOnce(mockData);
        const results = await ProviderService.updateProvider({ name: 'Uber Uganda' }, 100);
        expect(results[1][0].name)
          .toEqual('Uber Uganda');
      });

      it('should fail to update user email doesnt exist', async () => {
        jest.spyOn(UserService, 'getUserByEmail')
          .mockReturnValue(null);
        jest.spyOn(UserService, 'createUserByEmail')
          .mockReturnValue(null);

        const results = await ProviderService.updateProvider(mockProviderUpdateData, 1);
        expect(UserService.getUserByEmail)
          .toBeCalled();
        expect(results)
          .toEqual({ message: 'User with email doesnt exist' });
      });
      it('should delete a provider successfully', async () => {
        Provider.destroy = jest.fn(() => 1);
        const result = await ProviderService.deleteProvider(1);
        expect(result)
          .toEqual(
            1
          );
      });

      it('should return zero for unexisting data', async () => {
        Provider.destroy = jest.fn(() => 0);

        const result = await ProviderService.deleteProvider(1);
        expect(result).toEqual(0);
      });
    });
    it('should find provider by PK', async () => {
      const mockResponse = { dataValues: { ...mockProviderRecord } };
      jest.spyOn(Provider, 'findByPk').mockReturnValue(mockResponse);
      const results = await ProviderService.findByPk(1, true);
      expect(Provider.findByPk).toHaveBeenCalledWith(
        expect.any(Number), expect.any(Object)
      );
      expect(results).toEqual(mockProviderRecord);
    });

    it('should find provider by user id', async () => {
      jest.spyOn(Provider, 'findOne').mockReturnValue(mockProviderRecord);
      const results = await providerService.findProviderByUserId(16);
      expect(results).toEqual(mockProviderRecord);
    });

    it('should get viable providers in providers drop down', async () => {
      const dummyProviders = [{
        dataValues: {
          vehicles: mockCabsData.cabs, drivers: mockDriversData
        }
      }];
      jest.spyOn(Provider, 'findAll').mockResolvedValue(dummyProviders);
      await ProviderService.getViableProviders();
      expect(Provider.findAll).toBeCalled();
    });
  });
  describe('getProviderBySlackId', () => {
    it('should get provider by slack id', async () => {
      const result = await ProviderService.getProviderBySlackId(3);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id', 'name', 'providerUserId', 'createdAt', 'updatedAt');
    });
    it('should get provider by slack id', async () => {
      const result = await ProviderService.getProviderBySlackId(1);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id', 'name', 'providerUserId', 'createdAt', 'updatedAt');
    });
  });

  describe('getProviderByUserId', () => {
    it('should get provider by slack id', async () => {
      const result = await ProviderService.getProviderByUserId(16);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id', 'name', 'providerUserId', 'createdAt', 'updatedAt',
        'deletedAt');
    });
    it('should get provider by slack id', async () => {
      const result = await ProviderService.getProviderByUserId(2);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id', 'name', 'providerUserId', 'createdAt', 'updatedAt');
    });
  });
});
