import DriversValidator from '../DriversValidator';
import HttpError from '../../helpers/errorHandler';
import { providerService } from '../../services/ProviderService';
import { driverService } from '../../services/DriverService';

describe('DriversValidator Middleware', () => {
  let [response, next] = [];
  const request = {
    params: {
      providerId: 1,
      driverId: 2
    },
  };

  beforeEach(() => {
    response = {
      status: jest.fn(),
      json: jest.fn(),
    };
    next = jest.fn();
    HttpError.sendErrorResponse = jest.fn();
  });

  afterEach(() => jest.restoreAllMocks());
  
  describe('DriversValidator.validateProviderDriverIdParams', () => {
    it('should call next() if there are no validation errors', async () => {
      await DriversValidator.validateProviderDriverIdParams(request, response, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
    it('should respond with validation errors for invalid params', async () => {
      const invalidRequest = {
        params: {
          providerId: 'invalid',
          driverId: 'invalid'
        },
      };
      const sendErrorResponseSpy = jest.spyOn(HttpError, 'sendErrorResponse');
      await DriversValidator.validateProviderDriverIdParams(invalidRequest, response, next);
      expect(sendErrorResponseSpy).toHaveBeenCalled();
    });
  });
  describe('DriversValidator > validateParams', () => {
    it('should return a list', (done) => {
      expect(DriversValidator.validateParams({})).toStrictEqual([]);
      done();
    });
    it('should return a list of errors', (done) => {
      const params = { providerId: 'invalid', driverId: 'invalid' };
      expect(DriversValidator.validateParams(params)).toHaveLength(2);
      done();
    });
  });
  describe('DriversValidator > validateIsProviderDriver', () => {
    const provider = {
      dataValues: { id: 1 },
      hasDriver: jest.fn(() => true),
    };
    const driver = { dataValues: { id: 2, providerId: 1 } };

    beforeEach(() => {
      jest.spyOn(providerService, 'getProviderById').mockResolvedValue(provider);
      jest.spyOn(driverService, 'getDriverById').mockResolvedValue(driver);
    });
    
    it('should call next() if driver belongs to provider', async () => {
      await DriversValidator.validateIsProviderDriver(request, response, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
    it('should respond with error if driver does not belong to provider', async () => {
      provider.hasDriver = jest.fn(() => false);
      await DriversValidator.validateIsProviderDriver(request, response, next);
      const sendErrorResponseSpy = jest.spyOn(HttpError, 'sendErrorResponse');
      const errorPayload = {
        message: 'Sorry, driver does not belong to the provider',
        statusCode: 400,
      };
      expect(sendErrorResponseSpy).toHaveBeenCalledWith(errorPayload, response);
    });
    it('should handle unexpected exception', async () => {
      jest.spyOn(providerService, 'getProviderById').mockReturnValue(null);
      await DriversValidator.validateIsProviderDriver(request, response, next);
      const sendErrorResponseSpy = jest.spyOn(HttpError, 'sendErrorResponse');
      expect(sendErrorResponseSpy).toHaveBeenCalled();
    });
  });
});
