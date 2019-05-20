import {
  providers, paginatedData, successMessage, returnedData
} from '../__mocks__/ProviderMockData';
import ProvidersController from '../ProvidersController';
import ProviderService from '../../../services/ProviderService';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import HttpError from '../../../helpers/errorHandler';
import ProviderHelper from '../../../helpers/providerHelper';
import Response from '../../../helpers/responseHelper';

describe('ProviderController', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('ProviderController_getAllProviders', () => {
    let req;
    let res;
    let providerServiceSpy;
    beforeEach(() => {
      req = {
        query: {
          page: 1, size: 3, name: 'uber'
        }
      };
      res = {
        status: jest.fn(() => ({
          json: jest.fn(() => { })
        })).mockReturnValue({ json: jest.fn() })
      };
      providerServiceSpy = jest.spyOn(ProviderService, 'getProviders');
      jest.spyOn(Response, 'sendResponse');
      jest.spyOn(BugsnagHelper, 'log');
      jest.spyOn(HttpError, 'sendErrorResponse');
    });
    it('Should get all providers', async () => {
      const paginateSpy = jest.spyOn(ProviderHelper, 'paginateData');
      providerServiceSpy.mockResolvedValue(providers);
      paginateSpy.mockReturnValue(paginatedData);
      await ProvidersController.getAllProviders(req, res);
      expect(ProviderHelper.paginateData).toHaveBeenCalled();
      expect(Response.sendResponse).toBeCalledWith(res, 200, true, successMessage, returnedData);
    });

    it('Should catch errors', async () => {
      const error = new Error('Something went wrong');
      providerServiceSpy.mockRejectedValue(error);
      await ProvidersController.getAllProviders(req, res);
      expect(BugsnagHelper.log).toBeCalledWith(error);
      expect(HttpError.sendErrorResponse).toBeCalledWith(error, res);
    });
  });
});
