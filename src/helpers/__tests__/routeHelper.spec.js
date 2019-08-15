import RouteHelper from '../RouteHelper';
import RouteService, { routeService } from '../../services/RouteService';
import { cabService } from '../../services/CabService';
import {
  routeBatch, batch, returnNullPercentage, record, confirmedRecord,
  returnedPercentage, percentagesList, singlePercentageArray,
  returnedMaxObj, returnedMinObj, emptyRecord, routeResult,
  LocationCoordinates, returnedLocation, returnedAddress,
  newRouteWithBatchData, singleRouteDetails
} from '../__mocks__/routeMock';
import LocationService from '../../services/LocationService';
import AddressService from '../../services/AddressService';
import RouteRequestService from '../../services/RouteRequestService';
import RouteNotifications from '../../modules/slack/SlackPrompts/notifications/RouteNotifications';
import ConfirmRouteUseJob from '../../services/jobScheduler/jobs/ConfirmRouteUseJob';

let status;

describe('Route Helpers', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('checkNumberValues', () => {
    it('should fail if value is not a non-zero integer', () => {
      const message = RouteHelper.checkNumberValues('string', 'someField');
      expect(message).toEqual(['someField must be a non-zero integer greater than zero']);
    });
  });

  describe('checkRequestProps', () => {
    it('should return missing fields', () => {
      const fields = RouteHelper.checkRequestProps({
        vehicle: 'APP 519 DT',
        routeName: 'Yaba',
        destination: ''
      });
      expect(fields).toEqual(', capacity, takeOffTime, provider');
    });
  });

  describe('checkThatVehicleRegNumberExists', () => {
    it('should return array containing results for the check', async () => {
      jest.spyOn(cabService, 'findByRegNumber').mockResolvedValue({ id: 1 });
      const result = await RouteHelper.checkThatVehicleRegNumberExists('AR 3GN UMBR');
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual(true);
    });

    it('should return array containing with first element false when vehicle absent', async () => {
      jest.spyOn(cabService, 'findByRegNumber').mockResolvedValue(null);
      const result = await RouteHelper.checkThatVehicleRegNumberExists('AR 3GN UMBR');
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual(false);
    });
  });

  describe('checkThatRouteNameExists', () => {
    it('should return array containing results for the check', async () => {
      jest.spyOn(routeService, 'getRouteByName').mockResolvedValue({ id: 2, });
      const result = await RouteHelper.checkThatRouteNameExists('Yaba');
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual(true);
    });

    it('should return array containing with first element false when route missing', async () => {
      jest.spyOn(routeService, 'getRouteByName').mockResolvedValue(null);
      const result = await RouteHelper.checkThatRouteNameExists('Yaba');
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0]).toEqual(false);
    });
  });

  describe('duplicateRouteBatch', () => {
    it('should return the newly created batch object', async () => {
      jest.spyOn(RouteService, 'getRouteBatchByPk').mockResolvedValue(routeBatch);
      jest.spyOn(RouteHelper, 'cloneBatchDetails').mockResolvedValue(batch);

      const { batch: batchInfo, routeName } = await RouteHelper.duplicateRouteBatch(1);
      expect(batchInfo.batch).toBe('B');
      expect(batchInfo.inUse).toBe(0);
      expect(routeName).toBe('O\'Conner Roads');
    });

    it('should not create batch if route batch does not exist', async () => {
      jest.spyOn(RouteService, 'getRouteBatchByPk').mockResolvedValue(null);

      const result = await RouteHelper.duplicateRouteBatch(10);

      expect(result).toBe('Route does not exist');
    });
  });

  describe('cloneBatchDetails', () => {
    it('should get the details for updated route batch', async () => {
      batch.batch = 'F';
      jest.spyOn(routeService, 'createRouteBatch').mockReturnValue(batch);
      const clonedBatch = await RouteHelper.cloneBatchDetails(routeBatch);

      expect(clonedBatch.batch).toEqual('F');
      expect(routeService.createRouteBatch).toHaveBeenCalled();
    });
  });

  describe('batchObject', () => {
    it('add batch to routeBatch object', () => {
      const result = RouteHelper.batchObject(routeBatch, 'A');

      expect(result).toEqual({
        batch: 'A', capacity: 4, status: 'Active', takeOff: '03:00'
      });
    });
  });

  describe('findPercentageUsage, findMaxOrMin', () => {
    it('should calculate and return dormant routes', () => {
      const result = RouteHelper.findPercentageUsage(record, [], []);
      expect(result).toEqual(returnNullPercentage);
    });
    it('should calculate and return percentages', () => {
      const result = RouteHelper.findPercentageUsage(confirmedRecord, [], []);
      expect(result).toEqual(returnedPercentage);
    });
    it('should check the most used and least used route', () => {
      const resultMax = RouteHelper.findMaxOrMin(percentagesList, 'max');
      const resultMin = RouteHelper.findMaxOrMin(percentagesList, 'min');
      const resultNull = RouteHelper.findMaxOrMin([], 'min');
      const resultSingleRecord = RouteHelper.findMaxOrMin(singlePercentageArray, 'min');
      expect(resultMax).toEqual(returnedMaxObj);
      expect(resultMin).toEqual(returnedMinObj);
      expect(resultSingleRecord).toEqual(emptyRecord);
      expect(resultNull).toEqual({ emptyRecord });
    });
  });
  describe('RouteHelper.pageDataObject', () => {
    it('should return an object of the route data', () => {
      const routesData = RouteHelper.pageDataObject(routeResult);
      expect(routesData.pageMeta).toBeDefined();
      expect(routesData.pageMeta.totalPages).toBe(1);
      expect(routesData.pageMeta.totalResults).toBe(1);
      expect(routesData.pageMeta.pageSize).toBe(100);
    });
  });

  describe('validateRouteStatus', () => {
    it('should throw error if request is already approved', () => {
      status = RouteHelper.validateRouteStatus({ status: 'Approved' });
      expect(status).toEqual('This request has already been approved');
    });

    it('should throw error if request is already declined', () => {
      status = RouteHelper.validateRouteStatus({ status: 'Declined' });
      expect(status).toEqual('This request has already been declined');
    });

    it('should throw error if request is pending', () => {
      status = RouteHelper.validateRouteStatus({ status: 'Pending' });
      expect(status).toEqual('This request needs to be confirmed by the manager first');
    });

    it('should return true if request is confirmed', () => {
      status = RouteHelper.validateRouteStatus({ status: 'Confirmed' });
      expect(status).toEqual(true);
    });
  });

  describe('Route Trip Notifications', () => {
    it('should send route trip reminder message to rider', () => {
      jest.spyOn(RouteNotifications, 'sendRouteTripReminder');
      RouteHelper.sendTakeOffReminder();
      expect(RouteNotifications.sendRouteTripReminder).toHaveBeenCalled();
    });

    it('should send route trip completion message to rider', () => {
      jest.spyOn(RouteNotifications, 'sendRouteUseConfirmationNotificationToRider');
      RouteHelper.sendCompletionNotification();
      expect(RouteNotifications.sendRouteUseConfirmationNotificationToRider).toHaveBeenCalled();
    });
  });

  describe('createNewRouteBatchFromSlack', () => {
    it('should create a new route batch from slack', async (done) => {
      jest.spyOn(RouteHelper, 'createNewRouteWithBatch').mockReturnValue([]);
      jest.spyOn(RouteRequestService, 'findByPk').mockReturnValue([]);
      const submission = {
        routeName: 'New Route',
        takeOffTime: '00:30',
        capacity: 10,
        providerId: 1
      };

      await RouteHelper.createNewRouteBatchFromSlack(submission, 1);
      expect(RouteHelper.createNewRouteWithBatch).toHaveBeenCalled();
      done();
    });
  });

  describe('createNewRouteWithBatch', () => {
    it('should create a new route batch', async (done) => {
      const route = { ...singleRouteDetails };
      jest.spyOn(AddressService, 'createNewAddress').mockReturnValue(returnedAddress);
      jest.spyOn(RouteService, 'createRoute').mockReturnValue({ route });
      jest.spyOn(routeService, 'createRouteBatch').mockResolvedValue(batch);
      jest.spyOn(ConfirmRouteUseJob, 'scheduleTakeOffReminders').mockResolvedValue();
      const result = await RouteHelper.createNewRouteWithBatch(newRouteWithBatchData);
      expect(routeService.createRouteBatch).toHaveBeenCalled();
      expect(result.route).toEqual(singleRouteDetails);
      expect(result.batch).toEqual(batch);
      done();
    });
  });

  describe('checkThatAddressAlreadyExists', () => {
    it('should return true when address exists', async (done) => {
      jest.spyOn(AddressService, 'findAddress').mockReturnValue(returnedAddress);
      const result = await RouteHelper.checkThatAddressAlreadyExists('Bus Provider');
      expect(AddressService.findAddress).toHaveBeenCalledWith('Bus Provider');
      expect(result).toEqual(true);
      done();
    });

    it('should return false when address does not exist', async (done) => {
      jest.spyOn(AddressService, 'findAddress').mockReturnValue(null);
      const result = await RouteHelper.checkThatAddressAlreadyExists('Bus Provider');
      expect(result).toEqual(false);
      done();
    });
  });

  describe('checkThatLocationAlreadyExists', () => {
    it('should return true when location already exists', async (done) => {
      jest.spyOn(LocationService, 'findLocation').mockReturnValue(returnedLocation);
      const result = await RouteHelper.checkThatLocationAlreadyExists(LocationCoordinates);

      expect(LocationService.findLocation).toHaveBeenCalledWith('-1.32424324', '1.34243535');
      expect(result).toEqual(true);
      done();
    });

    it('should return false when location does not exist', async (done) => {
      jest.spyOn(LocationService, 'findLocation').mockReturnValue(null);
      const result = await RouteHelper.checkThatLocationAlreadyExists(LocationCoordinates);
      expect(result).toEqual(false);
      done();
    });
  });
});
