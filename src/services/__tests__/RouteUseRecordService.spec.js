import RouteUseRecordService from '../RouteUseRecordService';
import models from '../../database/models';
import BatchUseRecordService from '../BatchUseRecordService';
import { MAX_INT as all } from '../../helpers/constants';
import RouteService from '../RouteService';
import { mockRecord } from '../__mocks__';


const { RouteUseRecord, } = models;

describe('RouteUseRecordService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe('createRouteUseRecord', () => {
    it('should create createRouteUseRecord successfully', async () => {
      jest.spyOn(RouteService, 'getRoute').mockResolvedValue({ riders: [] });
      jest.spyOn(RouteUseRecordService, 'getRouteUseRecords')
        .mockResolvedValue({ data: [] });
      jest.spyOn(BatchUseRecordService, 'createBatchUseRecord')
        .mockResolvedValue({ data: [] });
      jest.spyOn(RouteUseRecordService, 'updateUsageStatistics')
        .mockResolvedValue({ data: [] });
      jest.spyOn(RouteUseRecord, 'create').mockResolvedValue({ data: [] });
      await RouteUseRecordService.createRouteUseRecord(1);
      expect(BatchUseRecordService.createBatchUseRecord).toBeCalledTimes(1);
      expect(RouteUseRecordService.updateUsageStatistics).toBeCalledTimes(1);
    });

    it('should not create route use record if it aready exists for that day', async () => {
      jest.spyOn(RouteService, 'getRoute').mockResolvedValue({ riders: [] });
      jest.spyOn(RouteUseRecordService, 'getRouteUseRecords')
        .mockResolvedValue({ data: [{}, {}] });
      jest.spyOn(BatchUseRecordService, 'createBatchUseRecord')
        .mockResolvedValue({ data: [] });
      jest.spyOn(RouteUseRecordService, 'updateUsageStatistics')
        .mockResolvedValue({ data: [] });
      jest.spyOn(RouteUseRecord, 'create').mockResolvedValue({ data: [] });
      await RouteUseRecordService.createRouteUseRecord(1);
      expect(RouteUseRecord.create).toBeCalledTimes(0);
    });
  });

  describe('getRouteUseRecords', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should get getRouteUseRecords', async () => {
      const { itemsPerPage } = await RouteUseRecordService.getRouteUseRecords({ page: 1, size: all }, {});
      expect(itemsPerPage).toEqual(4294967295);
    });

    it('should get getRouteUseRecords', async () => {
      const { itemsPerPage } = await RouteUseRecordService.getRouteUseRecords();
      expect(itemsPerPage).toEqual(4294967295);
    });
  });
  describe('updateRouteUseRecord', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should updateRouteUseRecord', async () => {
      jest.spyOn(RouteUseRecord, 'update').mockResolvedValue();
      await RouteUseRecordService.updateRouteUseRecord(1, {});
      expect(RouteUseRecord.update).toBeCalledWith({ ...{} }, { returning: true, where: { id: 1 } });
    });
  });

  describe('updateUsageStatistics', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should updateUsageStatistics', async () => {
      jest.spyOn(BatchUseRecordService, 'getBatchUseRecord')
        .mockResolvedValue({
          data: [{
            userAttendStatus: 'Confirmed'
          }, {
            userAttendStatus: 'Skip'
          }, {
            userAttendStatus: 'NotConfirmed'
          }, {
            userAttendStatus: 'Pending'
          },
          ]
        });
      jest.spyOn(RouteUseRecordService, 'updateRouteUseRecord').mockResolvedValue();
      await RouteUseRecordService.updateUsageStatistics(1);
      expect(RouteUseRecordService.updateRouteUseRecord).toBeCalledTimes(1);
      expect(RouteUseRecordService.updateRouteUseRecord).toBeCalled();
      expect(await RouteUseRecordService.updateRouteUseRecord).toBeCalledWith(1, {
        confirmedUsers: 1, pendingUsers: 1, skippedUsers: 1, unConfirmedUsers: 1
      });
    });
  });

  describe('getAdditionalInfo', () => {
    it('should get average ratings and utilization for data', () => {
      const routeTrips = RouteUseRecordService.getAdditionalInfo(mockRecord);
      expect(routeTrips[0].utilization).toEqual('0');
      expect(routeTrips[0].averageRating).toEqual('4.00');
    });
  });
});
