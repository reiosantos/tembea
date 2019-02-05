import { mockRouteRequestData } from '../../../services/__mocks__';
import RouteRequestService from '../../../services/RouteRequestService';
import RouteController from '../RouteController';

describe('RouteController', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn(() => ({
        json: jest.fn(() => {})
      })).mockReturnValue({ json: jest.fn() })
    };
  });

  afterEach(async (done) => {
    jest.restoreAllMocks();
    jest.restoreAllMocks();
    done();
  });

  describe('getAll()', () => {
    it('should return all route requests', async (done) => {
      RouteRequestService.getAllConfirmedRouteRequests = jest.fn(() => mockRouteRequestData);

      await RouteController.getAll(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledWith({ routes: mockRouteRequestData });
      done();
    });

    it('should throw an Error', async (done) => {
      RouteRequestService.getAllConfirmedRouteRequests = jest.fn(() => {
        throw Error('This is an error');
      });

      await RouteController.getAll(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'An error has occurred', success: false
      });
      done();
    });
  });
});
