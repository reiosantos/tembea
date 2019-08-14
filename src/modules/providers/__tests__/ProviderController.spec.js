import {
  providers, paginatedData, successMessage, returnedData, viableProviders
} from '../__mocks__/ProviderMockData';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import ProviderHelper from '../../../helpers/providerHelper';
import Response from '../../../helpers/responseHelper';
import models from '../../../database/models';

import ProviderService from '../../../services/ProviderService';
import HttpError from '../../../helpers/errorHandler';
import UserService from '../../../services/UserService';
import {
  mockReturnedProvider,
  mockProvider,
  mockExistingProvider,
  mockUser,
} from '../../../services/__mocks__';
import ProviderController from '../ProviderController';

const { sequelize } = models;

describe('ProviderController', () => {
  let req;
  let providerServiceSpy;
  const res = {
    status() {
      return this;
    },
    json() {
      return this;
    }
  };

  HttpError.sendErrorResponse = jest.fn();
  Response.sendResponse = jest.fn();
  BugsnagHelper.log = jest.fn();

  beforeEach(() => {
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });


  describe('ProviderController_getAllProviders', () => {
    beforeEach(() => {
      providerServiceSpy = jest.spyOn(ProviderService, 'getProviders');
      req = {
        query: {
          page: 1,
          size: 3,
          name: 'uber'
        },
        currentUser: { userInfo: { email: 'ddd@gmail.com' } },
        headers: {
          homebaseid: '4'
        }
      };
    });

    it('Should get all providers', async () => {
      const paginateSpy = jest.spyOn(ProviderHelper, 'paginateData');
      providerServiceSpy.mockResolvedValue(providers);
      paginateSpy.mockReturnValue(paginatedData);
      jest.spyOn(UserService, 'getUserByEmail').mockImplementation(() => ({ email: 'ddd@gmail.com' }));
      await ProviderController.getAllProviders(req, res);
      expect(ProviderHelper.paginateData)
        .toHaveBeenCalled();
      expect(Response.sendResponse)
        .toBeCalledWith(res, 200, true, successMessage, returnedData);
    });

    it('Should catch errors', async () => {
      const error = new Error('Something went wrong');
      providerServiceSpy.mockRejectedValue(error);
      jest.spyOn(UserService, 'getUserByEmail').mockImplementation(() => ({ email: 'ddd@gmail.com' }));
      await ProviderController.getAllProviders(req, res);
      expect(BugsnagHelper.log)
        .toBeCalledWith(error);
      expect(HttpError.sendErrorResponse)
        .toBeCalledWith(error, res);
    });
  });

  describe('ProviderController_addProvider', () => {
    const providerData = {
      name: 'Uber Kenya',
      email: 'allan@andela.com'
    };
    let providerSpy;

    beforeEach(() => {
      req = {
        body: {
          name: 'Uber',
          email: 'allan@andela.com'
        },
        headers: {
          homebaseid: '4'
        }
      };
      jest.spyOn(UserService, 'getUserByEmail')
        .mockResolvedValue(mockUser);
      providerSpy = jest.spyOn(ProviderService, 'createProvider');
    });

    it('creates a provider successfully', async () => {
      const { homebaseid } = req.headers;
      providerSpy.mockResolvedValue(mockReturnedProvider);
      res.locals = { providerData };
      await ProviderController.addProvider(req, res);
      expect(ProviderService.createProvider)
        .toHaveBeenCalledWith({ ...providerData, homebaseid });
      expect(res.status)
        .toHaveBeenCalledWith(201);
      expect(res.json)
        .toHaveBeenCalledWith({
          success: true,
          message: 'Provider created successfully',
          provider: mockProvider.provider
        });
    });

    it('returns a 409 error if provider exists', async () => {
      const { homebaseid } = req.headers;
      providerSpy.mockResolvedValue(mockExistingProvider);
      await ProviderController.addProvider(req, res);
      expect(ProviderService.createProvider)
        .toHaveBeenCalledWith({ ...providerData, homebaseid });
      expect(res.status)
        .toHaveBeenCalledWith(409);
      expect(res.json)
        .toHaveBeenCalledWith({
          success: false,
          message: 'The provider with name: \'Uber Kenya\' already exists'
        });
    });

    it('logs HTTP errors', async () => {
      const err = 'validationError';
      providerSpy.mockRejectedValueOnce(err);
      await ProviderController.addProvider(req, res);
      expect(BugsnagHelper.log)
        .toHaveBeenCalledWith(err);
      expect(HttpError.sendErrorResponse)
        .toHaveBeenCalledWith(err, res);
    });
  });

  describe('ProviderController_updateProvider', () => {
    it('should update provider successfully', async () => {
      providerServiceSpy = jest.spyOn(ProviderService, 'updateProvider').mockReturnValue([1, [{}]]);
      req = {
        params: 1,
        body: {
          name: 'Sharks Uber',
          email: 'Sharks@uber.com'
        }
      };
      await ProviderController.updateProvider(req, res);
      expect(Response.sendResponse).toBeCalled();
      expect(Response.sendResponse).toBeCalledWith(res, 200, true, 'Provider Details updated Successfully', {});
    });

    it('should return message if provider doesnt exist', async () => {
      providerServiceSpy = jest.spyOn(ProviderService, 'updateProvider').mockReturnValue([0, []]);
      req = {
        params: 100,
        body: {
          name: 'Sharks Uber',
          email: 'Sharks@uber.com'
        }
      };
      await ProviderController.updateProvider(req, res);
      expect(Response.sendResponse).toBeCalledWith(res, 404, false, 'Provider doesnt exist');
    });

    it('should return message if user doesnt exist', async () => {
      providerServiceSpy = jest.spyOn(ProviderService, 'updateProvider').mockReturnValue({
        message: 'user with email doesnt exist'
      });
      req = {
        params: 100,
        body: {
          name: 'Sharks Uber',
          email: 'Sharks@uber.com'
        }
      };
      await ProviderController.updateProvider(req, res);
      expect(Response.sendResponse).toBeCalledWith(res, 404, false, 'user with email doesnt exist');
    });

    it('should return message if update fails', async () => {
      const error = new Error('Something went wrong');
      providerServiceSpy = jest.spyOn(ProviderService, 'updateProvider').mockRejectedValue(error);
      req = {
        params: 100,
        body: {
          name: 'Sharks Uber',
          email: 'Sharks@uber.com'
        }
      };
      await ProviderController.updateProvider(req, res);
      expect(BugsnagHelper.log).toBeCalled();
      expect(Response.sendResponse).toBeCalled();
    });
    it('should return message for sequelize validation error', async () => {
      const error = new sequelize.ValidationError();
      providerServiceSpy = jest.spyOn(ProviderService, 'updateProvider').mockRejectedValue(error);
      req = {
        params: 100,
        body: {
          name: 'Sharks Uber',
          email: 'Sharks@uber.com'
        }
      };
      await ProviderController.updateProvider(req, res);
      expect(BugsnagHelper.log).toBeCalled();
      expect(Response.sendResponse).toBeCalled();
    });
  });
  describe('ProviderController_deleteProvider', () => {
    let deleteProviderSpy;
    let message;
    beforeEach(() => {
      req = {
        params: {
          id: 1
        },
        headers: {
          homebaseid: '4'
        }
      };
    });
    beforeEach(() => {
      deleteProviderSpy = jest.spyOn(ProviderService, 'deleteProvider');
    });

    it('should return server error', async () => {
      deleteProviderSpy.mockRejectedValueOnce('something happened');
      const serverError = {
        message: 'Server Error. Could not complete the request',
        statusCode: 500
      };
      await ProviderController.deleteProvider(req, res);
      expect(BugsnagHelper.log).toHaveBeenCalledWith('something happened');
      expect(HttpError.sendErrorResponse).toHaveBeenCalledWith(serverError, res);
    });

    it('should delete a provider successfully', async () => {
      message = 'Provider deleted successfully';
      deleteProviderSpy.mockReturnValue(1);
      await ProviderController.deleteProvider(req, res);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 200, true, message);
    });

    it('should return provider does not exist', async () => {
      message = 'Provider does not exist';
      deleteProviderSpy.mockReturnValue(0);
      await ProviderController.deleteProvider(req, res);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, message);
    });
  });
  
  describe('GetViableProviders', () => {
    it('Should get a list of viable providers', async () => {
      jest.spyOn(ProviderService, 'getViableProviders').mockResolvedValue(viableProviders);
      await ProviderController.getViableProviders(req);
      expect(ProviderService.getViableProviders).toHaveBeenCalled();
    });
    it('should return a 404 error', async () => {
      const message = 'No viable provider exists';
      jest.spyOn(ProviderService, 'getViableProviders').mockResolvedValue([]);
      await ProviderController.getViableProviders(req, res);
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false, message);
    });
  });
});
