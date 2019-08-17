import RoutesController from '../RouteController';
import RouteRequestService from '../../../services/RouteRequestService';
import UserService from '../../../services/UserService';
import Response from '../../../helpers/responseHelper';
import { SlackEvents } from '../../slack/events/slackEvents';
import { mockRouteRequestData } from '../../../services/__mocks__';
import TeamDetailsService from '../../../services/TeamDetailsService';
import { Cache } from '../../slack/RouteManagement/rootFile';
import RouteHelper from '../../../helpers/RouteHelper';

describe('RoutesController', () => {
  const botToken = 'xxop-sdsad';
  const opsChannelId = 'QEWEQEQ';
  const declineReq = {
    params: { requestId: 1 },
    currentUser: { userInfo: { email: 'john.smith@gmail.com' } },
    body: {
      newOpsStatus: 'decline',
      comment: 'stuff',
      teamUrl: 'tembea.slack.com',
      takeOff: '11:20',
      provider: {
        id: 1,
        name: 'Andela Cabs',
        providerUserId: 15
      }
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

  const returnedOpsData = { id: 10, slackId: 'wewrwwe' };
  const confirmedRouteRequest = {
    ...mockRouteRequestData,
    status: 'Confirmed'
  };

  const declinedRouteRequest = {
    ...mockRouteRequestData,
    status: 'Pending',
    opsComment: 'not allowed'
  };
  
  const approvedRouteRequest = {
    ...mockRouteRequestData,
    status: 'Approved',
    opsComment: 'allowed'
  };

  describe('updateRouteRequestStatus', () => {
    let res;

    beforeEach(() => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
        .mockResolvedValue({ botToken, opsChannelId });
      jest.spyOn(SlackEvents, 'raise').mockResolvedValue();
      jest.spyOn(Cache, 'fetch').mockResolvedValue('12234234.090345');
      jest.spyOn(RouteHelper, 'updateRouteRequest').mockResolvedValue(approvedRouteRequest);
      jest.spyOn(RouteHelper, 'createNewRouteWithBatch').mockImplementation();
      jest.spyOn(UserService, 'getUserByEmail').mockResolvedValue(returnedOpsData);
      jest.spyOn(RoutesController, 'completeRouteApproval');
      jest.spyOn(RoutesController, 'getSubmissionDetails');
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

    it('should update route request', async (done) => {
      jest.spyOn(RouteRequestService, 'getRouteRequestByPk')
        .mockResolvedValue(confirmedRouteRequest);
      jest.spyOn(RouteHelper, 'updateRouteRequest').mockResolvedValue(approvedRouteRequest);
      await RoutesController.updateRouteRequestStatus(approveReq, res);

      expect(RoutesController.completeRouteApproval).toHaveBeenCalledWith(
        expect.any(Object), expect.any(Object), expect.any(String), expect.any(String)
      );
      expect(SlackEvents.raise).toHaveBeenCalled();
      done();
    });

    it('should handle error when route request is not found', async (done) => {
      jest.spyOn(RouteRequestService, 'getRouteRequestByPk').mockResolvedValue();
      jest.spyOn(Response, 'sendResponse');
      await RoutesController.updateRouteRequestStatus(approveReq, res);

      expect(Response.sendResponse).toHaveBeenCalledWith(
        res, 404, false, 'Route request not found.'
      );
      done();
    });

    it('should handle error when route request is already approved', async (done) => {
      jest.spyOn(RouteRequestService, 'getRouteRequestByPk')
        .mockResolvedValue(approvedRouteRequest);
      jest.spyOn(Response, 'sendResponse');
      await RoutesController.updateRouteRequestStatus(approveReq, res);

      expect(Response.sendResponse).toHaveBeenCalledWith(
        res, 409, false, 'This request has already been approved'
      );
      done();
    });

    it('should send notification when request is declined', async (done) => {
      jest.spyOn(RouteRequestService, 'getRouteRequestByPk')
        .mockResolvedValue(confirmedRouteRequest);
      jest.spyOn(RouteHelper, 'updateRouteRequest')
        .mockResolvedValue(declinedRouteRequest);

      await RoutesController.updateRouteRequestStatus(declineReq, res);

      expect(SlackEvents.raise).toHaveBeenCalled();
      done();
    });
  });
});
