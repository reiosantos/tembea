import { data } from '../__mocks__/FellowsControllerMock';
import FellowsController from '../FellowsController';
import BatchUseRecordService from '../../../services/BatchUseRecordService';

describe('FellowsController_getFellowROuteActivity', () => {
  let req;
  let res;
  let mockedData;
  beforeEach(() => {
    req = { query: { page: 1, size: 2, id: 15 } };
    mockedData = {
      data,
      pageMeta: {
        totalPages: 1,
        pageNo: 1,
        totalItems: 7,
        itemsPerPage: 5
      }
    };
    res = {
      status: jest.fn(() => ({
        json: jest.fn(() => {})
      })).mockReturnValue({ json: jest.fn() })
    };
    jest.spyOn(BatchUseRecordService, 'getBatchUseRecord').mockResolvedValue(
      mockedData
    );
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  it('should return an array of fellow route activity', async () => {
    await FellowsController.getFellowRouteActivity(req, res);

    expect(BatchUseRecordService.getBatchUseRecord).toBeCalled();
    expect(BatchUseRecordService.getBatchUseRecord).toHaveBeenCalledWith(
      { page: 1, size: 2 }, { userId: 15 }
    );
   
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledTimes(1);
  });

  it('should throw an error', async () => {
    jest.spyOn(BatchUseRecordService, 'getBatchUseRecord').mockRejectedValue(
      new Error('dummy error')
    );

    await FellowsController.getFellowRouteActivity(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      message: 'dummy error',
      success: false
    });
  });
});
