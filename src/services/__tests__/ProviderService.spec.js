import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import ProviderHelper from '../../helpers/providerHelper';
import ProviderService from '../ProviderService';
import UserService from '../UserService';
import { mockGetCabsData, mockCreatedProvider, mockReturnedProvider } from '../__mocks__';
import models from '../../database/models';

const { Provider } = models;
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
        size: 10
      });
      expect(SequelizePaginationHelper).toHaveBeenCalled();
      expect(getPageItems).toHaveBeenCalledWith(1);
      expect(ProviderHelper.serializeDetails).toHaveBeenCalled();
    });
  });

  describe('createProvider', () => {
    beforeEach(() => {
      jest.spyOn(Provider, 'findOrCreate').mockResolvedValue(mockCreatedProvider);
    });
    it('test createProvider', async () => {
      const result = await ProviderService.createProvider('Uber', 3);
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
        expect(result)
          .toEqual(0);
      });
    });
    it('should find provider by PK', async () => {
      const mockResponse = {
        dataValues: {
          id: 1,
          driverName: 'Test',
          driverNumber: '0702432331',
          driverPhoneNo: '0702432331'
        }
      };
      jest.spyOn(Provider, 'findByPk').mockReturnValue(mockResponse);
      const results = await ProviderService.findProviderByPk(1);
      expect(results).toBeDefined();
      expect(results).toEqual(mockResponse);
    });
    it('should find provider by user id', async () => {
      const mockResponse = {
        dataValues: {
          id: 1,
          name: 'Test',
          providerUserId: '16',
          createdAt: '2019-01-01 01:00:00+01',
          updatedAt: '2019-01-01 01:00:00+01'
        }
      };
      jest.spyOn(Provider, 'findOne').mockReturnValue(mockResponse);
      const results = await ProviderService.findProviderByUserId(16);
      expect(results).toBeDefined();
      expect(results).toEqual(mockResponse);
    });
  });
});
