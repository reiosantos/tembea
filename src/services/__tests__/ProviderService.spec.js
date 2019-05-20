import SequelizePaginationHelper from '../../helpers/sequelizePaginationHelper';
import ProviderHelper from '../../helpers/providerHelper';
import ProviderService from '../ProviderService';
import { mockGetCabsData } from '../__mocks__';

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
});
