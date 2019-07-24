import RoutesController from '../RouteController';
import RouteRequestService from '../../../services/RouteRequestService';
import UserService from '../../../services/UserService';
import Response from '../../../helpers/responseHelper';
import HttpError from '../../../helpers/errorHandler';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import { SlackEvents } from '../../slack/events/slackEvents';

describe('RoutesController', () => {
  const declineReq = {
    params: { requestId: 1 },
    currentUser: { userInfo: { email: 'john.smith@gmail.com' } },
    body: {
      newOpsStatus: 'decline',
      comment: 'stuff',
      teamUrl: 'tembea.slack.com'
    }
  };

  const approveReq = {
    params: { requestId: 1 },
    currentUser: { userInfo: { email: 'john.smith@gmail.com' } },
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
    provider: {
      id: 1,
      name: 'Andela Cabs',
      providerUserId: 15,
    },
    routeName: 'HighWay',
    takeOffTime: '10:00AM',
    teamUrl: 'tester@andela.com',
  };

  describe('updateRouteRequestStatus', () => {
    const res = {
      status: () => ({
        json: () => {}
      })
    };

    beforeEach(() => {
      jest.spyOn(res, 'status');
      jest.spyOn(RoutesController, 'formatRoute');
      jest.spyOn(RoutesController, 'sendNotificationToProvider');
      jest.spyOn(RoutesController, 'sendDeclineNotificationToFellow');
      jest.spyOn(RoutesController, 'getUpdatedRouteRequest');
      jest.spyOn(RouteRequestService, 'updateRouteRequest');
      jest.spyOn(HttpError, 'sendErrorResponse');
      jest.spyOn(BugsnagHelper, 'log');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return a 500 response on network error', async () => {
      RouteRequestService.getRouteRequest = jest.fn(() => {
        throw Error('random error');
      });

      await RoutesController.updateRouteRequestStatus(approveReq, res);
      expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
      expect(BugsnagHelper.log).toHaveBeenCalled();
    });

    it('should change the status of the route request to declined', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        dataValues: {
          status: 'Confirmed'
        },
        status: 'Confirmed'
      }));
      jest.spyOn(UserService, 'getUserByEmail').mockResolvedValue({ id: 9, name: 'John smith' });
      await RoutesController.updateRouteRequestStatus(declineReq, res);

      expect(RouteRequestService.getRouteRequest).toHaveBeenCalled();
      expect(RoutesController.getUpdatedRouteRequest).toHaveBeenCalled();
      expect(RouteRequestService.updateRouteRequest).toHaveBeenCalledWith(1, {
        opsComment: 'stuff',
        opsReviewerId: 9,
        status: 'Declined',
      });
      expect(RoutesController.sendDeclineNotificationToFellow).toHaveBeenCalled();
    });

    it('should change the status of the route request to approved', async () => {
      const eventsMock = jest.spyOn(SlackEvents, 'raise').mockImplementation();
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        dataValues: {
          status: 'Confirmed'
        },
        status: 'Confirmed'
      }));

      jest.spyOn(UserService, 'getUserByEmail').mockResolvedValue({ id: 9, name: 'John smith' });

      await RoutesController.updateRouteRequestStatus(approveReq, res);
      expect(RouteRequestService.getRouteRequest).toHaveBeenCalled();
      expect(RouteRequestService.updateRouteRequest).toHaveBeenCalledWith(1, {
        opsComment: 'stuff',
        opsReviewerId: 9,
        status: 'Approved',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(eventsMock).toHaveBeenCalled();
    });

    it('should throw an error if route has already been approved or declined', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => ({
        dataValues: {
          status: 'Approved'
        },
        status: 'Approved'
      }));
      jest.spyOn(Response, 'sendResponse');

      await RoutesController.updateRouteRequestStatus(approveReq, res);
      expect(Response.sendResponse).toHaveBeenCalled();
      expect(Response.sendResponse)
        .toHaveBeenCalledWith(res, 409, false, 'This request has already been approved');
    });

    it('should throw an error if no route request us found', async () => {
      jest.spyOn(RouteRequestService, 'getRouteRequest').mockImplementation(() => null);
      jest.spyOn(Response, 'sendResponse').mockImplementation(() => {});

      await RoutesController.updateRouteRequestStatus(declineReq, res);

      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
    });
  });

  describe('formatRoute', () => {
    it('should return proper submission data', () => {
      const result = RoutesController.formatRoute(mockRouteRequest, approveReq.body);

      expect(result).toEqual(submission);
    });
  });
});
