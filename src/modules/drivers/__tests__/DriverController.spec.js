import DriverController from '../DriverController';
import Response from '../../../helpers/responseHelper';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import DriverService from '../../../services/DriverService';
import ProviderService from '../../../services/ProviderService';
import {
  createReq, expected, mockData, existingUserMock
} from './mockData';

describe('DriverController', () => {
  let createDriverSpy;
  let res;

  Response.sendResponse = jest.fn();
  BugsnagHelper.log = jest.fn();

  beforeEach(() => {
    createDriverSpy = jest.spyOn(DriverService, 'createProviderDriver');
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
      jest.spyOn(ProviderService, 'findProviderByPk').mockReturnValue({});
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
  });
});
