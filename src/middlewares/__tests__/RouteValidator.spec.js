import RouteValidator from '../RouteValidator';
import Response from '../../helpers/responseHelper';
import GeneralValidator from '../GeneralValidator';

describe('Route Validator', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('validate route batch status', () => {
    it('should call next middleware when acceptable status is passed', () => {
      const reqMock = { body: { status: 'Active' } };
      const nextMock = jest.fn();
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.validateRouteBatchStatus(reqMock, 'res', nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call response method when an unacceptable status is passed', () => {
      const reqMock = { body: { status: 'Pending' } };
      const nextMock = jest.fn();
      const errMessage = 'status can either \'Active\' or \'Inactive\'.';
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.validateRouteBatchStatus(reqMock, 'res', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, errMessage);
    });
  });

  describe('validate RouteId Parameter', () => {
    it('should call RouteValidator.validateIdParam', () => {
      const reqMock = {
        params: { routeId: 1 },
        route: { path: '/routes/:routeId' }
      };
      const nextMock = jest.fn();
      const spy = jest.spyOn(RouteValidator, 'validateIdParam');

      RouteValidator.validateRouteIdParam(reqMock, 'res', nextMock);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('res', 1, 'routeId', nextMock);
    });
  });

  describe('validate RouteBatchId Parameter', () => {
    it('should call RouteValidator.validateIdParam', () => {
      const reqMock = {
        params: { routeBatchId: 1 },
        route: { path: '/routes/:routeBatchId' }
      };
      const nextMock = jest.fn();
      const spy = jest.spyOn(RouteValidator, 'validateIdParam');

      RouteValidator.validateRouteIdParam(reqMock, 'res', nextMock);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('res', 1, 'routeBatchId', nextMock);
    });
  });
  describe('validate validateIdParam', () => {
    it('should call next method when the id is valid', () => {
      const nextMock = jest.fn();
      jest.spyOn(GeneralValidator, 'validateNumber').mockReturnValue(true);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.validateIdParam('res', true, 'id', nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call response method when the id is not valid', () => {
      const nextMock = jest.fn();
      const errorMessage = 'Please provide a positive integer value for id';
      jest.spyOn(GeneralValidator, 'validateNumber').mockReturnValue(false);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.validateIdParam('res', false, 'id', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, errorMessage);
    });
  });
});
