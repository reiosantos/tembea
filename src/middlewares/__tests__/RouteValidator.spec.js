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

  describe('validate all props', () => {
    it('should call next method if all property exist', () => {
      const reqMock = {
        body: {
          routeName: 'Yaba',
          capacity: 3,
          vehicle: 'HSJ 3893',
          takeOffTime: '12:00',
          destination: {
            address: 'Yaba Left, EPIC Tower',
            coordinates: {
              lat: '3.40949',
              lng: '-0.99393'
            }
          }
        }
      };
      const nextMock = jest.fn();
      jest.spyOn(RouteHelper, 'checkRequestProps').mockReturnValue([]);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.verifyAllPropsExist(reqMock, 'res', nextMock);

      expect(nextMock).toHaveBeenCalled();
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call error response method if any property doesnt exist', () => {
      const reqMock = {
        body: {
          routeName: '',
          capacity: 3,
          vehicle: '',
          takeOffTime: '12:00',
          destination: {
            address: '',
            coordinates: {
              lat: '3.40949',
              lng: '-0.99393'
            }
          }
        }
      };
      const nextMock = jest.fn();
      jest.spyOn(RouteHelper, 'checkRequestProps').mockReturnValue([1]);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.verifyAllPropsExist(reqMock, 'res', nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
    });
  });

  describe('validate value types', () => {
    it('should call next if all value types are valid', () => {
      const reqMock = {
        body: {
          routeName: 'Yaba',
          capacity: 3,
          vehicle: 'HSJ 3893',
          takeOffTime: '12:00',
          destination: {
            address: 'Yaba Left, EPIC Tower',
            coordinates: {
              lat: '3.40949',
              lng: '-0.99393'
            }
          }
        }
      };
      const nextMock = jest.fn();
      jest.spyOn(RouteHelper, 'checkRequestProps').mockReturnValue([]);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.verifyPropsValuesAreSetAndValid(reqMock, 'res', nextMock);

      expect(nextMock).toHaveBeenCalled();
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call error response if all value types are invalid', () => {
      const reqMock = {
        body: {
          routeName: '',
          capacity: 'jdjdk',
          vehicle: 'HSJ 3893',
          takeOffTime: '12:00',
          destination: {
            address: 'Yaba Left, EPIC Tower',
            coordinates: {
              lat: '3.40949',
              lng: '-0.99393'
            }
          }
        }
      };
      const nextMock = jest.fn();
      const errorMessage = 'Your request contain errors';
      const errors = [
        'Enter a value for routeName',
        'capacity must be a non-zero integer greater than zero'
      ];
      jest.spyOn(RouteHelper, 'checkRequestProps').mockReturnValue([2]);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      RouteValidator.verifyPropsValuesAreSetAndValid(reqMock, 'res', nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, errorMessage, errors);
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

  describe('validate destination address', () => {
    it('should call next() when creating new route which address doesnt exist', async () => {
      const reqMock = {
        body: { destination: { address: 'EPIC Tower' } },
      };
      const nextMock = jest.fn();
      jest.spyOn(RouteHelper, 'checkThatAddressAlreadyExists').mockReturnValue(false);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      await RouteValidator.validateDestinationAddress(reqMock, 'res', nextMock);

      expect(nextMock).toHaveBeenCalled();
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call response method when creating new route which address does exist', async () => {
      const reqMock = {
        body: { destination: { address: 'EPIC Tower' } },
        query: { action: '' }
      };
      const nextMock = jest.fn();
      const errorMessage = 'Address already exists';
      jest.spyOn(RouteHelper, 'checkThatAddressAlreadyExists').mockReturnValue(true);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      await RouteValidator.validateDestinationAddress(reqMock, 'res', nextMock);

      expect(nextMock).not.toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, errorMessage);
    });

    it('should call next() when duplicating a route which address does exist', async () => {
      const reqMock = {
        body: { destination: { address: 'EPIC Tower' } },
        query: { action: 'duplicate' }
      };
      const nextMock = jest.fn();
      jest.spyOn(RouteHelper, 'checkThatAddressAlreadyExists').mockReturnValue(true);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      await RouteValidator.validateDestinationAddress(reqMock, 'res', nextMock);

      expect(nextMock).toHaveBeenCalled();
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });
  });

  describe('validate destination Coordinates', () => {
    it('should call next() when creating new route which coordinate doesnt exist', async () => {
      const reqMock = {
        body: { destination: { coordinates: '3.9904, -0.59939' } },
        query: { action: '' }
      };
      const nextMock = jest.fn();
      jest.spyOn(RouteHelper, 'checkThatLocationAlreadyExists').mockReturnValue(false);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      await RouteValidator.validateDestinationCoordinates(reqMock, 'res', nextMock);

      expect(nextMock).toHaveBeenCalled();
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });

    it('should call response method when creating new route which coordinate does exist',
      async () => {
        const reqMock = {
          body: { destination: { coordinates: '3.9904, -0.59939' } },
          query: { action: '' }
        };
        const nextMock = jest.fn();
        const errorMessage = 'Provided coordinates belong to an existing address';
        jest.spyOn(RouteHelper, 'checkThatLocationAlreadyExists').mockReturnValue(true);
        jest.spyOn(Response, 'sendResponse').mockImplementation();

        await RouteValidator.validateDestinationCoordinates(reqMock, 'res', nextMock);

        expect(nextMock).not.toHaveBeenCalled();
        expect(Response.sendResponse).toHaveBeenCalledTimes(1);
        expect(Response.sendResponse).toHaveBeenCalledWith('res', 400, false, errorMessage);
      });

    it('should call next() when duplicating a route which coordinate does exist', async () => {
      const reqMock = {
        body: { destination: { coordinates: '3.9904, -0.59939' } },
        query: { action: 'duplicate' }
      };
      const nextMock = jest.fn();
      jest.spyOn(RouteHelper, 'checkThatLocationAlreadyExists').mockReturnValue(true);
      jest.spyOn(Response, 'sendResponse').mockImplementation();

      await RouteValidator.validateDestinationCoordinates(reqMock, 'res', nextMock);

      expect(nextMock).toHaveBeenCalled();
      expect(Response.sendResponse).not.toHaveBeenCalled();
    });
  });
});
