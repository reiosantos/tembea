import UserService from '../../../services/UserService';
import FellowController from '../FellowsController';
import BatchUseRecordService from '../../../services/BatchUseRecordService';
import aisService from '../../../services/AISService';
import {
  data,
  fellowMockData,
  fellows,
  userMock,
  aisMock,
  finalUserDataMock,
  fellowMockData2
} from '../__mocks__/FellowsControllerMock';
import {
  bugsnagHelper
} from '../../slack/RouteManagement/rootFile';

describe('fellow-controller', () => {
  let req = {
    query: {
      size: 2,
      page: 1
    }
  };
  let res;

  beforeEach(() => {
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getAllFellows', () => {
    it('should throw an error', async () => {
      req = {
        query: {
          size: 'meshack'
        }
      };
      jest.spyOn(UserService, 'getPagedFellowsOnOrOffRoute')
        .mockRejectedValue(new Error('no size'));
      const spy = jest.spyOn(bugsnagHelper, 'log').mockImplementation(jest.fn());
      await FellowController.getAllFellows(req, res);

      expect(spy).toBeCalledWith(new Error('no size'));
    });
    it('returns empty data response if no fellows', async () => {
      jest.spyOn(UserService, 'getPagedFellowsOnOrOffRoute').mockResolvedValue(fellows);

      await FellowController.getAllFellows(req, res);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Request was successful',
        data: {
          fellows: [],
          pageMeta: fellows.pageMeta
        }
      });
    });
    it('returns data if fellows on route', async () => {
      jest.spyOn(FellowController, 'mergeFellowData').mockResolvedValue(finalUserDataMock);
      jest.spyOn(UserService, 'getPagedFellowsOnOrOffRoute').mockResolvedValue(fellowMockData);

      await FellowController.getAllFellows(req, res);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Request was successful',
        data: {
          fellows: [finalUserDataMock],
          pageMeta: {
            currentPage: 1,
            limit: 1,
            totalItems: 5,
            totalPages: 5,
          }
        }
      });
    });

    it('returns data of fellows not on route', async () => {
      jest.spyOn(FellowController, 'mergeFellowData').mockResolvedValue(finalUserDataMock);
      jest.spyOn(UserService, 'getPagedFellowsOnOrOffRoute').mockResolvedValue(fellowMockData2);

      await FellowController.getAllFellows(req, res);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });

  describe('mergeFellowData', () => {
    it('Returns merged fellows data ', async () => {
      jest.spyOn(BatchUseRecordService, 'getUserRouteRecord').mockResolvedValue(userMock);
      jest.spyOn(aisService, 'getUserDetails').mockResolvedValue(aisMock);

      const result = await FellowController.mergeFellowData(req, res);
      expect(result).toEqual(finalUserDataMock);
    });
  });

  describe('FellowsController_getFellowROuteActivity', () => {
    let mockedData;
    beforeEach(() => {
      req = {
        query: {
          page: 1,
          size: 2,
          id: 15
        }
      };
      mockedData = {
        data,
        pageMeta: {
          totalPages: 1,
          pageNo: 1,
          totalItems: 7,
          itemsPerPage: 5
        }
      };
      jest.spyOn(BatchUseRecordService, 'getBatchUseRecord').mockResolvedValue(
        mockedData
      );
    });

    it('should return an array of fellow route activity', async () => {
      await FellowController.getFellowRouteActivity(req, res);

      expect(BatchUseRecordService.getBatchUseRecord).toHaveBeenCalled();
      expect(BatchUseRecordService.getBatchUseRecord).toHaveBeenCalledWith({
        page: 1,
        size: 2
      }, {
        userId: 15
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledTimes(1);
    });

    it('should throw an error', async () => {
      jest.spyOn(BatchUseRecordService, 'getBatchUseRecord').mockRejectedValue(
        new Error('dummy error')
      );

      await FellowController.getFellowRouteActivity(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'dummy error',
        success: false
      });
    });
  });
});
