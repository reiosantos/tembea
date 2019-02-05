import RoutesController from '../RouteController';
import { RouteRequestService } from '../../slack/RouteManagement/rootFile';
import HttpError from '../../../helpers/errorHandler';

describe('RoutesController', () => {
  describe('changeRouteRequestStatus', () => {
    const res = {
      status: () => ({
        json: () => {}
      })
    };
    const req = {
      params: {
        requestId: 1
      },
      body: {
        newOpsStatus: 'decline',
        comment: 'stuff',
        reviewerEmail: 'test.buddy2@andela.com'
      }
    };

    beforeEach(() => {
      jest.spyOn(res, 'status');
      jest.spyOn(RouteRequestService, 'updateRouteRequest').mockImplementation();
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        dataValues: {
          status: 'Pending'
        },
        status: 'Pending'
      }));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should change the status of the route request', async () => {
      await RoutesController.changeRouteRequestStatus(req, res);

      expect(RouteRequestService.getRouteRequest).toHaveBeenCalledTimes(1);
      expect(RouteRequestService.updateRouteRequest).toHaveBeenCalledWith(1, {
        status: 'Pending'
      });
    });

    it('should send the right status code', async () => {
      jest.spyOn(res, 'status');

      await RoutesController.changeRouteRequestStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
    });
    
    it('should throw an error if no route request us found', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => null);
      jest.spyOn(HttpError, 'sendErrorResponse').mockImplementation(() => {});

      await RoutesController.changeRouteRequestStatus(req, res);

      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    });
  });
});
