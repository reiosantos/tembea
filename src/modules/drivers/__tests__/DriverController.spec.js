import DriverController from '../DriverController';
import Response from '../../../helpers/responseHelper';
import { driverService } from '../../../services/DriverService';
import ProviderService from '../../../services/ProviderService';
import {
  createReq, expected, mockData, existingUserMock
} from './mockData';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import payloadData from '../__mocks__/driversMocks';
import HttpError from '../../../helpers/errorHandler';
import BatchUseRecordService from '../../../services/BatchUseRecordService';
import { route } from '../../slack/RouteManagement/__mocks__/providersController.mock';

describe('DriverController', () => {
  bugsnagHelper.log = jest.fn();
  let createDriverSpy;
  let updateDriverSpy;
  let res;

  Response.sendResponse = jest.fn();

  beforeEach(() => {
    createDriverSpy = jest.spyOn(driverService, 'create');
    res = {
      status: jest.fn(() => ({
        json: jest.fn(() => { })
      })).mockReturnValue({ json: jest.fn() })
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('DriverController_addDriver', () => {
    it('should create driver successfully', async () => {
      jest.spyOn(ProviderService, 'findByPk').mockReturnValue({});
      createDriverSpy.mockReturnValue(mockData);
      await DriverController.addProviderDriver(createReq, res);
      expect(Response.sendResponse).toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 201, true,
        'Driver added successfully', expected);
    });

    it('should return errors if they exist', async () => {
      createDriverSpy.mockReturnValue({
        errors: [
          {
            message: 'driverPhoneNo must be unique'
          }
        ]
      });
      await DriverController.addProviderDriver({}, res);
      expect(Response.sendResponse).toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 400, false,
        'driverPhoneNo must be unique');
    });

    it('should return error if a driver with a number exists', async () => {
      createDriverSpy.mockReturnValue(existingUserMock);
      await DriverController.addProviderDriver(createReq, res);
      expect(Response.sendResponse).toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 409, false,
        `Driver with  driver Number ${createReq.body.driverNumber} already exists`);
    });

    it('should throw an error if creating a driver fails', async () => {
      createDriverSpy.mockRejectedValue('Something went wrong');
      await DriverController.addProviderDriver(createReq, res);
      expect(Response.sendResponse).toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalledWith(res, 500, false,
        'An error occurred in the creation of the driver');
    });
    describe('Update driver', () => {
      beforeEach(() => {
        updateDriverSpy = jest.spyOn(driverService, 'update');
        createReq.params = { driverId: 1 };
        jest.spyOn(driverService, 'update').mockResolvedValue({});
      });
      it('update a driver', async () => {
        updateDriverSpy.mockResolvedValue({});
        await DriverController.update(createReq, res);
        expect(Response.sendResponse).toHaveBeenCalledWith(res, 200, true,
          'Driver updated successfully', {});
      });

      it('should respond with an error if the driver does not exist', async () => {
        updateDriverSpy.mockResolvedValue({ message: 'Driver not found' });
        await DriverController.update(createReq, res);
        expect(Response.sendResponse).toHaveBeenCalledWith(res, 404, false,
          'Driver not found');
      });

      it('should catch errors', async () => {
        jest.spyOn(bugsnagHelper, 'log');
        jest.spyOn(HttpError, 'sendErrorResponse');
        updateDriverSpy.mockRejectedValue({ error: 'Something went wrong' });
        await DriverController.update(createReq, res);
        expect(bugsnagHelper.log).toHaveBeenCalledWith({ error: 'Something went wrong' });
        expect(HttpError.sendErrorResponse).toHaveBeenCalled();
      });
    });
  });

  describe('DriverController.deleteDriver', () => {
    it('should successfully delete a driver', async () => {
      const driver = { dataValues: { id: 2, providerId: 1 } };
      const req = { body: { slackUrl: 'adaeze-tembea.slack.com' } };
      res.locals = { driver };
      jest.spyOn(BatchUseRecordService, 'findActiveRouteWithDriverOrCabId').mockResolvedValue([route]);
      jest.spyOn(driverService, 'deleteDriver').mockResolvedValue(1);
      await DriverController.deleteDriver(req, res);
      expect(Response.sendResponse).toHaveBeenCalled();
    });
  });

  describe('DriversController_getAllDrivers', () => {
    let req;
    let driverServiceSpy;
    beforeEach(() => {
      req = {
        query: {
          page: 1, size: 3
        }
      };
      res = {
        status: jest.fn(() => ({
          json: jest.fn(() => { })
        })).mockReturnValue({ json: jest.fn() })
      };
      driverServiceSpy = jest.spyOn(driverService, 'getPaginatedItems');
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('Should get all drivers and return a success message', async () => {
      const {
        successMessage, drivers, returnedData
      } = payloadData;

      jest.spyOn(Response, 'sendResponse');
      driverServiceSpy.mockResolvedValue(drivers);
      await DriverController.getDrivers(req, res);
      expect(driverService.getPaginatedItems).toHaveBeenCalled();
      expect(Response.sendResponse).toBeCalledWith(res, 200, true, successMessage, returnedData);
    });

    it('Should catch errors', async () => {
      const error = new Error('Something went wrong');
      driverServiceSpy.mockRejectedValue(error);
      jest.spyOn(bugsnagHelper, 'log');
      jest.spyOn(HttpError, 'sendErrorResponse');
      await DriverController.getDrivers(req, res);
      expect(bugsnagHelper.log).toBeCalledWith(error);
      expect(HttpError.sendErrorResponse).toBeCalledWith(error, res);
    });
  });
});
