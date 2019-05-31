import RoutesController from '../RouteController';
import { RouteRequestService } from '../../slack/RouteManagement/rootFile';
import HttpError from '../../../helpers/errorHandler';

describe('RoutesController', () => {
  const declineReq = {
    params: { requestId: 1 },
    body: {
      newOpsStatus: 'decline',
      comment: 'stuff',
      reviewerEmail: 'test.buddy2@andela.com'
    }
  };

  const approveReq = {
    params: { requestId: 1 },
    body: {
      newOpsStatus: 'approve',
      comment: 'stuff',
      reviewerEmail: 'test.buddy2@andela.com',
      routeName: 'HighWay',
      takeOff: '10:00AM',
      teamUrl: 'tester@andela.com',
      provider: {
        id: 1,
        name: 'Andela Cabs',
        providerUserId: 15
      }
    }
  };

  const mockRouteRequest = {
    home: { dataValues: { id: 1, address: 'BBBBBB', locationId: 1 } },
  };

  const submission = {
    routeName: 'highway',
    takeOffTime: '10:00AM',
    Provider: '1,Andela Cabs,15',
    teamUrl: 'tester@andela.com'
  };

  describe('updateRouteRequestStatus', () => {
    const res = {
      status: () => ({
        json: () => {}
      })
    };

    beforeEach(() => {
      jest.spyOn(res, 'status');
      jest.spyOn(RoutesController, 'saveRoute');
      jest.spyOn(RoutesController, 'sendNotificationToProvider');
      jest.spyOn(RouteRequestService, 'updateRouteRequest').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should change the status of the route request to declined', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        dataValues: {
          status: 'Pending'
        },
        status: 'Pending'
      }));
      await RoutesController.updateRouteRequestStatus(declineReq, res);

      expect(RouteRequestService.getRouteRequest).toHaveBeenCalledTimes(1);
      expect(RouteRequestService.updateRouteRequest).toHaveBeenCalledWith(1, {
        opsComment: 'stuff',
        opsReviewerId: 9,
        status: 'Declined',
      });
    });

    it('should change the status of the route request to approved', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        dataValues: {
          status: 'Approved'
        },
        status: 'Approved'
      }));
      await RoutesController.updateRouteRequestStatus(approveReq, res);

      expect(RoutesController.saveRoute).toHaveBeenCalledTimes(1);
      expect(RouteRequestService.getRouteRequest).toHaveBeenCalledTimes(1);
      expect(RouteRequestService.updateRouteRequest).toHaveBeenCalledWith(1, {
        opsComment: 'stuff',
        opsReviewerId: 9,
        status: 'Approved',
      });
    });

    it('should send the right status code', async () => {
      jest.spyOn(res, 'status');

      await RoutesController.updateRouteRequestStatus(declineReq, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should throw an error if no route request us found', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => null);
      jest.spyOn(HttpError, 'sendErrorResponse').mockImplementation(() => {});

      await RoutesController.updateRouteRequestStatus(declineReq, res);

      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendNotificationToProvider', () => {
    it('should send notification to provider', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => mockRouteRequest);
      await RoutesController.sendNotificationToProvider(1, submission);

      expect(RouteRequestService.getRouteRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatProviderDetails', () => {
    it('should return formatted provider details', () => {
      const providerInfo = { id: 1, name: 'John Cabs', providerUserId: 16 };
      const result = RoutesController.formatProviderDetails(providerInfo);

      expect(result).toEqual('1,John Cabs,16');
    });
  });

  describe('saveRoute', () => {
    it('should return proper submission data', () => {
      const result = RoutesController.saveRoute(mockRouteRequest, approveReq.body);

      expect(result).toEqual(submission);
    });
  });
});
