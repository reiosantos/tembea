import models from '../../database/models';
import BatchUseRecordService from '../BatchUseRecordService';
import { MAX_INT as all } from '../../helpers/constants';
import { routeData, data } from '../__mocks__';


const { BatchUseRecord, } = models;

describe('BatchUseRecordService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('createBatchUseRecord', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should create createBatchUseRecord successfully', async () => {
      jest.spyOn(BatchUseRecordService, 'getBatchUseRecord').mockResolvedValue({ data: [] });
      jest.spyOn(BatchUseRecord, 'create').mockResolvedValue({ data: [] });
      const result = await BatchUseRecordService.createBatchUseRecord(1, [{ userId: 1 }]);
      expect(result).toEqual(true);
    });

    it('should not create create Batch Use Record it aready exists for that day', async () => {
      jest.spyOn(BatchUseRecordService, 'getBatchUseRecord').mockResolvedValue(
        { data: [{ userId: 1, batchRecordId: 2 }] }
      );
      jest.spyOn(BatchUseRecord, 'create').mockResolvedValue({ data: [] });
      await BatchUseRecordService.createBatchUseRecord(1, [{}]);
      expect(BatchUseRecord.create).toBeCalledTimes(0);
    });
  });

  describe('getBatchUseRecord', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should get getBatchUseRecord', async () => {
      const { pageMeta: { itemsPerPage } } = await BatchUseRecordService.getBatchUseRecord({ page: 1, size: all }, {});
      expect(itemsPerPage).toEqual(4294967295);
    });

    it('should get getRouteUseRecords', async () => {
      const { pageMeta: { itemsPerPage } } = await BatchUseRecordService.getBatchUseRecord();
      expect(itemsPerPage).toEqual(4294967295);
    });
  });
  describe('getUserRouteRecord', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
    it('should get all route user record', async () => {
      const {
        userId, totalTrips, tripsTaken
      } = await BatchUseRecordService.getUserRouteRecord(1);
      expect({
        userId,
        totalTrips,
        tripsTaken
      }).toEqual({
        userId: 1,
        totalTrips: 0,
        tripsTaken: 0
      });
    });
  });

  describe('updateBatchUseRecord', () => {
    it('should updateBatchUseRecord', async () => {
      jest.spyOn(BatchUseRecord, 'update');
      await BatchUseRecordService.updateBatchUseRecord(1);
      expect(BatchUseRecord.update).toBeCalled();
    });
  });

  describe('BatchUseRecordService_serializeUser', () => {
    it('should return the required user info', () => {
      const user = {
        id: 1, name: 'okello', slackId: 'TP4K3', email: 'ronald.okello@andela.com'
      };
      const response = BatchUseRecordService.serializeUser(user);

      expect(response).toEqual(
        {
          id: 1, name: 'okello', slackId: 'TP4K3', email: 'ronald.okello@andela.com'
        }
      );
    });
    it('should return empty object when there is no user', () => {
      const response = BatchUseRecordService.serializeUser();
      expect(response).toEqual({});
    });
  });

  describe('BatchUseRecordService_serializeRouteBatch', () => {
    it('should return the required route info', () => {
      const response = BatchUseRecordService.serializeRouteBatch(routeData);
      expect(response).toEqual(
        {
          batch: {
            batchId: 1001, comments: 'Went to the trip', status: 'Activ', takeOff: '09:50'
          },
          cabDetails: {
            cabId: 10, driverName: 'Kafuuma Henry', driverPhoneNo: 256772312456, regNumber: 'UBE321A'
          },
          departureDate: '2018-05-03 09:50',
          id: 1,
          route: {
            destination: {
              address: '629 O\'Connell Flats',
              locationId: 1002,
            },
            name: 'Hoeger Pine',
            routeId: 1001
          },
          routeId: 1001
        }
      );
    });
    it('should return empty object when there is no route', () => {
      const response = BatchUseRecordService.serializeRouteBatch();
      expect(response).toEqual({});
    });
  });

  describe('BatchUseRecordService_serializeBatchRecord', () => {
    it('should have all the properties a batch record', () => {
      const response = BatchUseRecordService.serializeBatchRecord(data);

      expect(response).toHaveProperty('userId');
      expect(response).toHaveProperty('rating');
      expect(response).toHaveProperty('user.email');
      expect(response).toHaveProperty('user.slackId');
      expect(response).toHaveProperty('routeUseRecord');
    });
  });
  describe('BatchUseRecordService_getRoutesUsage', () => {
    it('should fetch all routes and batch records', async () => {
      const mockData = [];
      const sequelizeSpy = jest.spyOn(models.sequelize, 'query');
      sequelizeSpy.mockReturnValue(mockData);
      const results = await BatchUseRecordService.getRoutesUsage();
      expect(sequelizeSpy).toBeCalled();
      expect(results).toEqual(mockData);
    });
  });
});
