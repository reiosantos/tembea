import {
  TripConfirmSuccessMock,
  TripConfirmFailMock,
  TripDeclineSuccessMock
} from './__mocks__/TripsControllerMock';
import TripsController from '../TripsController';
import TripActionsController from '../../slack/TripManagement/TripActionsController';
import TeamDetailsService from '../../../services/TeamDetailsService';
import UserService from '../../../services/UserService';

import * as mocked from './__mocks__';
import tripService from '../../../services/TripService';

describe('TripController', () => {
  const { mockedValue: { routes: trips }, ...rest } = mocked;
  let req;
  beforeEach(() => {
    req = { query: { page: 1 } };
    const mockedData = {
      trips, totalPages: 2, pageNo: 1, totalItems: 1, itemsPerPage: 100
    };
    jest.spyOn(tripService, 'getTrips').mockResolvedValue(mockedData);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('TripController_getTrips', () => {
    it('Should get all trips value', async (done) => {
      const {
        resultValue: { message, success, data: mockedData },
        response: res
      } = rest;
      const data = { ...mockedData, trips };
      await TripsController.getTrips(req, res);
      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        data,
        message,
        success
      });
      done();
    });
    it('Should throw an error', async () => {
      const { response: res } = rest;
      jest
        .spyOn(tripService, 'getTrips')
        .mockRejectedValue(new Error('dummy error'));
      await TripsController.getTrips(req, res);
      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'dummy error',
        success: false
      });
    });
  });
});

describe('TripsController for update trip', () => {
  let reqConfirm;
  let req2;
  let reqDecline;
  let res;
  let payload;
  beforeEach(() => {
    reqConfirm = {
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
    reqDecline = {
      body: {
        driverName: 'nn',
        driverPhoneNo: '0777777777',
        regNumber: 'lmnbv',
        comment: 'ns',
        slackUrl: 'sokoolworkspace.slack.com'
      },
      params: { tripId: 15 },
      query: { action: 'decline' }
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
    it('updateTrip should run with confirm  success', async (done) => {
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
        .mockResolvedValue('success');
      await TripsController.updateTrip(reqConfirm, res);
      expect(TripActionsController.changeTripStatus).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenLastCalledWith(TripConfirmSuccessMock);
      done();
    });

    it('updateTrip() should run with decline success', async (done) => {
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
        .mockResolvedValue('success');
      await TripsController.updateTrip(reqDecline, res);
      expect(TripActionsController.changeTripStatus).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenLastCalledWith(TripDeclineSuccessMock);
      done();
    });
    it('updateTrip() should run with decline fail', async (done) => {
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
        .mockResolvedValue({ text: 'failed' });
      await TripsController.updateTrip(reqDecline, res);
      expect(TripActionsController.changeTripStatus).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenLastCalledWith(TripConfirmFailMock);
      done();
    });
    it('updateTrip() should run with confirm fail', async (done) => {
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
        .mockResolvedValue({ text: 'failed' });
      await TripsController.updateTrip(reqConfirm, res);
      expect(TripActionsController.changeTripStatus).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenLastCalledWith(TripConfirmFailMock);
      done();
    });
    it('getSlackIdFromReq() should return user Id', (done) => {
      jest
        .spyOn(UserService, 'getUserByEmail')
        .mockResolvedValue({});
      TripsController.getSlackIdFromReq({ userInfo: { email: 'paul@andela.com' } });
      expect(UserService.getUserByEmail).toHaveBeenCalledTimes(1);
      done();
    });
    it('getCommonPayloadParam() should should get payload', async (done) => {
      jest
        .spyOn(TripsController, 'getSlackIdFromReq')
        .mockResolvedValue('UG9MG84U8');
      jest
        .spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
        .mockResolvedValue({ teamId: 'kkk', opsChannelId: 'kk' });
      await TripsController.getCommonPayloadParam('', '', '');
      expect(TeamDetailsService.getTeamDetailsByTeamUrl).toHaveBeenCalledTimes(1);
      expect(TripsController.getSlackIdFromReq).toHaveBeenCalledTimes(1);
      done();
    });
    it('updateTrip() with missing data', async (done) => {
      jest
        .spyOn(TripsController, 'getCommonPayloadParam')
        .mockResolvedValue(payload);
      jest
        .spyOn(TripActionsController, 'changeTripStatus')
        .mockResolvedValue({ text: 'failed' });
      await TripsController.updateTrip(req2, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
