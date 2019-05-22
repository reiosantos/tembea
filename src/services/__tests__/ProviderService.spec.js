import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import ProviderHelper from '../../helpers/providerHelper';
import { mockGetCabsData } from '../__mocks__';
import ProviderService from '../ProviderService';
import models from '../../database/models';
import UserService from '../UserService';

const { Provider } = models;

jest.mock('../../helpers/sequelizePaginationHelper', () => jest.fn());
jest.mock('../../cache');


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
      expect(SequelizePaginationHelper)
        .toHaveBeenCalled();
      expect(getPageItems)
        .toHaveBeenCalledWith(1);
      expect(ProviderHelper.serializeDetails)
        .toHaveBeenCalled();
    });
    describe('ProviderService', () => {
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

    describe('Update Provider', async () => {
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
  });
});
