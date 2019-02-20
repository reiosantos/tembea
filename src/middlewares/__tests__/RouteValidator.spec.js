import RouteValidator from '../RouteValidator';
import Response from '../../helpers/responseHelper';
import GeneralValidator from '../GeneralValidator';
import RouteHelper from '../../helpers/RouteHelper';

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

  describe('validate RouteBatch Update Fields', () => {
    const reqMock = {
      body: {
        takeOff: '11:00',
        batch: 'B',
        name: 'Yaba',
        capacity: 12,
        inUse: 10,
        regNumber: 'XAH A7G FA'
      }
    };

    const reqMockInvalid = {
      body: {
        takeOff: '1100aa',
        batch: 'B',
        name: 'Yaba',
        capacity: 'not correct',
        inUse: '10 times wrong',
        regNumber: 'XAH A7G FA'
      }
    };

    const nextMock = jest.fn();
    it('should validate all request body data', async () => {
      jest.spyOn(RouteHelper, 'checkThatRouteNameExists').mockReturnValue([true, { id: 1 }]);
      jest.spyOn(RouteHelper, 'checkThatVehicleRegNumberExists').mockReturnValue([true, { id: 1 }]);
      await RouteValidator.validateRouteBatchUpdateFields(reqMock, 'res', nextMock);
      expect(nextMock).toHaveBeenCalledTimes(1);
    });

    it('should return error response when invalid data is provided', async () => {
      jest.spyOn(RouteHelper, 'checkThatRouteNameExists').mockReturnValue([false]);
      jest.spyOn(RouteHelper, 'checkThatVehicleRegNumberExists').mockReturnValue([false]);
      const spy = jest.spyOn(Response, 'sendResponse').mockImplementation();
      await RouteValidator.validateRouteBatchUpdateFields(reqMockInvalid, 'res', nextMock);
      expect(nextMock).not.toHaveBeenCalled();
      expect(spy.mock.calls[0][3].length).toEqual(5);
    });
  });
});
