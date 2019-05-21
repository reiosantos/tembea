import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import ProviderHelper from '../../helpers/providerHelper';
import ProviderService from '../ProviderService';
import { mockGetCabsData } from '../__mocks__';
import UserService from '../UserService';

jest.mock('../../helpers/sequelizePaginationHelper', () => jest.fn());

describe('ProviderService', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('getProviders', () => {
    beforeEach(() => {
      SequelizePaginationHelper.mockClear();
      ProviderHelper.serializeDetails = jest.fn();
    });

    it('returns a list of providers', async () => {
      const getPageItems = jest.fn().mockResolvedValue(mockGetCabsData);
      SequelizePaginationHelper.mockImplementation(() => ({
        getPageItems
      }));
      await ProviderService.getProviders({ page: 1, size: 10 });
      expect(SequelizePaginationHelper).toHaveBeenCalled();
      expect(getPageItems).toHaveBeenCalledWith(1);
      expect(ProviderHelper.serializeDetails).toHaveBeenCalled();
    });
  });

  describe('Update Provider', async () => {
    let mockProviderUpdateData;
    beforeEach(() => {
      mockProviderUpdateData = { email: 'fakeEmail@andela.com', name: 'Fake Provider' };
    });

    it('should update provider details successfully', async () => {
      const mockData = [1, [{ name: 'Uber Uganda' }]];
      jest.spyOn(UserService, 'getUserByEmail').mockReturnValue({
        dataValues: { id: 1 }
      });
      jest.spyOn(ProviderService, 'updateProvider').mockReturnValue(mockData);
      const results = await ProviderService.updateProvider({ name: 'Uber Uganda' }, 100);
      expect(results[1][0].name).toEqual('Uber Uganda');
    });

    it('should fail to update user email doesnt exist', async () => {
      jest.spyOn(UserService, 'getUserByEmail').mockReturnValue(null);
      const results = await ProviderService.updateProvider(mockProviderUpdateData, 1);
      expect(UserService.getUserByEmail).toBeCalled();
      expect(results).toEqual({ message: 'User with email doesnt exist' });
    });
  });
});
