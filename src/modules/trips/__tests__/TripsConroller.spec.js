import { TripConfirmSuccessMock } from '../__mocks__/TripsControllerMock';
import TripsController from '../TripsController';
import TripActionsController from '../../slack/TripManagement/TripActionsController';
import TeamDetailsService from '../../../services/TeamDetailsService';
import UserService from '../../../services/UserService';

describe('TripsController for confirm trip', () => {
  let req;
  let req2;
  let res;
  let payload;
  beforeEach(() => {
    req = {
      body: {
        driverName: 'nn',
        driverPhoneNo: '0777777777',
        regNumber: 'lmnbv',
        comment: 'ns',
        slackUrl: 'sokoolworkspace.slack.com'
      },
      params: { tripId: 15 },
      query: { action: 'confirm' }
    };
    req2 = {
      body: {
        driverName: 'nn',
        comment: 'ns',
        slackUrl: 'sokoolworkspace.slack.com'
      },
      params: { tripId: 15 },
      query: { action: 'confirm' }
    };
    res = {
      status: jest
        .fn(() => ({
          json: jest.fn(() => { })
        }))
        .mockReturnValue({ json: jest.fn() })
    };
    payload = {
      user: { id: 'UG9MG84U8' },
      team: { id: 'TGAAF6X8T' },
      channel: { id: 'CGACQJAE8' },
      state: '{"trip":"16","tripId":"16","actionTs":"1550735688.001800"}',
      submission:
      {
        confirmationComment: 'ns',
        driverName: 'sksk',
        driverPhoneNo: '093839',
        regNumber: '938'
      },
    };
  });

  afterEach((done) => {
    jest.restoreAllMocks();
    done();
  });


  describe('updateTrip() with confirm', () => {
    it('should run with success', (done) => {
      jest
        .spyOn(TripsController, 'getCommonPayloadParam')
        .mockResolvedValue(payload);
      jest
        .spyOn(TripsController, 'getSlackIdFromReq')
        .mockResolvedValue('UG9MG84U8');
      jest
        .spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
        .mockResolvedValue({ teamId: 'kkk', opsChannelId: 'kk' });
      jest
        .spyOn(TripActionsController, 'changeTripStatus')
        .mockResolvedValue();
      TripsController.updateTrip(req, res).then(() => {
        expect(TripActionsController.changeTripStatus).toHaveBeenCalledTimes(1);
        expect(res.status().json).toHaveBeenCalledTimes(1);
        expect(res.status().json).toHaveBeenLastCalledWith(TripConfirmSuccessMock);
      });
      done();
    });
    it('should run with fail', (done) => {
      jest
        .spyOn(TripsController, 'getCommonPayloadParam')
        .mockResolvedValue(payload);
      jest
        .spyOn(TripsController, 'getSlackIdFromReq')
        .mockResolvedValue('UG9MG84U8');
      jest
        .spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
        .mockResolvedValue({ teamId: 'kkk', opsChannelId: 'kk' });
      jest
        .spyOn(TripActionsController, 'changeTripStatus')
        .mockResolvedValue({ text: 'lkk' });
      TripsController.updateTrip(req, res).then(() => {
        expect(TripActionsController.changeTripStatus).toHaveBeenCalledTimes(1);
        expect(res.status().json).toHaveBeenCalledTimes(1);
        expect(res.status().json).toHaveBeenLastCalledWith(TripConfirmSuccessMock);
      });
      done();
    });
    it('should return user Id', (done) => {
      jest
        .spyOn(UserService, 'getUserByEmail')
        .mockResolvedValue({});
      TripsController.getSlackIdFromReq({ email: 'paul@andela.com' });
      expect(UserService.getUserByEmail).toHaveBeenCalledTimes(1);
      done();
    });
    it('should should get payload', (done) => {
      jest
        .spyOn(TripsController, 'getSlackIdFromReq')
        .mockResolvedValue('UG9MG84U8');
      jest
        .spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
        .mockResolvedValue({ teamId: 'kkk', opsChannelId: 'kk' });
      TripsController.getCommonPayloadParam('', '', '').then(() => {
        expect(TeamDetailsService.getTeamDetailsByTeamUrl).toHaveBeenCalledTimes(1);
        expect(TripsController.getSlackIdFromReq).toHaveBeenCalledTimes(1);
      });
      done();
    });
    it('updateTrip() with missing data', (done) => {
      jest
        .spyOn(TripsController, 'getCommonPayloadParam')
        .mockResolvedValue(payload);
      jest
        .spyOn(TripActionsController, 'changeTripStatus')
        .mockResolvedValue(TripConfirmSuccessMock);
      TripsController.updateTrip(req2, res);
      TripsController.updateTrip(req2, res).then(() => {
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledTimes(1);
      });
      done();
    });
  });
});
