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
    it('should call next method when the routeId is valid', () => {
      const reqMock = { params: { routeId: 1 } };
      const nextMock = jest.fn();
      jest.spyOn(GeneralValidator, 'validateNumber').mockReturnValue(true);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.validateRouteIdParam(reqMock, 'res', nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call response method when the routeId is not valid', () => {
      const reqMock = { params: { routeId: 1 } };
      const nextMock = jest.fn();
      const errorMessage = 'Please provide a positive integer value for routeId';
      jest.spyOn(GeneralValidator, 'validateNumber').mockReturnValue(false);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.validateRouteIdParam(reqMock, 'res', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, errorMessage);
    });
  });
});
