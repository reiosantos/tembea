import {
  TripConfirmSuccessMock,
  TripConfirmFailMock,
  TripDeclineSuccessMock
} from './__mocks__/TripsControllerMock';
import TripsController from '../TripsController';
import TripActionsController from '../../slack/TripManagement/TripActionsController';
import TeamDetailsService from '../../../services/TeamDetailsService';
import UserService from '../../../services/UserService';
import RouteUseRecordService from '../../../services/RouteUseRecordService';

import * as mocked from './__mocks__';
import tripService from '../../../services/TripService';
import TravelTripService from '../../../services/TravelTripService';
import SlackProviderHelper from '../../slack/helpers/slackHelpers/ProvidersHelper';
import ProviderNotifications from '../../slack/SlackPrompts/notifications/ProviderNotifications';
import HttpError from '../../../helpers/errorHandler';
import HomebaseService from '../../../services/HomebaseService';
import database from '../../../database';

describe('TripController', () => {
  const { mockedValue: { routes: trips }, ...rest } = mocked;
  let req;

  beforeEach(() => {
    req = { query: { page: 1 } };
    const mockedData = {
      trips, totalPages: 2, pageNo: 1, totalItems: 1, itemsPerPage: 100
    };
    jest.spyOn(tripService, 'getTrips').mockResolvedValue(mockedData);
    jest.spyOn(tripService, 'getById').mockResolvedValue(mocked.mockTrip.trip[0]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll((done) => database.close().then(done));

  describe('TripController_getTrips', () => {
    it('Should get all trips value', async () => {
      const {
        resultValue: { message, success, data: mockedData },
        response: res
      } = rest;
      req = {
        ...req,
        currentUser: {
          userInfo: {
            email: 'emma.ogwal@andela.com',
          }
        },
        headers: { homebaseid: 1 }
      };
      const data = { ...mockedData, trips };
      jest.spyOn(UserService, 'getUserByEmail').mockImplementation(() => ({ homebaseId: 1 }));
      jest.spyOn(tripService, 'getTrips').mockImplementation(() => ({
        totalPages: 2, trips, pageNo: 1, totalItems: 1, itemsPerPage: 100
      }));
      await TripsController.getTrips(req, res);
      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        data,
        message,
        success
      });
    });
    it('Should throw an error', async () => {
      const { response: res } = rest;
      req = {
        ...req,
        currentUser: {
          userInfo: {
            email: 'emma.ogwal@andela.com',
          }
        },
        headers: { homebaseid: 1 }
      };
      jest
        .spyOn(tripService, 'getTrips')
        .mockRejectedValue(new Error('dummy error'));
      jest.spyOn(UserService, 'getUserByEmail').mockImplementation(() => ({ homebaseId: 1 }));
      await TripsController.getTrips(req, res);
      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'dummy error',
        success: false
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
        params: { tripId: 3 },
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
        params: { tripId: 3 },
        query: { action: 'decline' }
      };
      req2 = {
        body: {
          driverName: 'nn',
          comment: 'ns',
          slackUrl: 'sokoolworkspace.slack.com'
        },
        params: { tripId: 3 },
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

      jest.spyOn(SlackProviderHelper, 'getProviderUserDetails').mockResolvedValue({});
      jest.spyOn(TripActionsController, 'getTripNotificationDetails').mockResolvedValue({});
      jest.spyOn(ProviderNotifications, 'sendTripNotification').mockResolvedValue({});
    });

    afterEach((done) => {
      jest.restoreAllMocks();
      done();
    });


    describe('updateTrip() with confirm', () => {
      it('updateTrip should run with confirm  success', async () => {
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
      });

      it('updateTrip() should run with decline success', async () => {
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
      });

      it('updateTrip() should run with decline fail', async () => {
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
      });

      it('updateTrip() should run with confirm fail', async () => {
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
      });

      it('getSlackIdFromReq() should return user Id', (done) => {
        jest
          .spyOn(UserService, 'getUserByEmail')
          .mockResolvedValue({});
        TripsController.getSlackIdFromReq({ userInfo: { email: 'paul@andela.com' } });
        expect(UserService.getUserByEmail).toHaveBeenCalledTimes(1);
        done();
      });

      it('getCommonPayloadParam() should should get payload', async () => {
        jest
          .spyOn(TripsController, 'getSlackIdFromReq')
          .mockResolvedValue('UG9MG84U8');
        jest
          .spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl')
          .mockResolvedValue({ teamId: 'kkk', opsChannelId: 'kk' });
        jest.spyOn(HomebaseService, 'getById').mockResolvedValue(
          { id: 1, name: 'Nairobi', channel: 12 }
        );
        await TripsController.getCommonPayloadParam('', '', '');
        expect(TeamDetailsService.getTeamDetailsByTeamUrl).toHaveBeenCalledTimes(1);
        expect(TripsController.getSlackIdFromReq).toHaveBeenCalledTimes(1);
      });

      it('updateTrip() with missing data', async () => {
        jest
          .spyOn(TripsController, 'getCommonPayloadParam')
          .mockResolvedValue(payload);
        jest
          .spyOn(TripActionsController, 'changeTripStatus')
          .mockResolvedValue({ text: 'failed' });
        await TripsController.updateTrip(req2, res);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.status().json).toHaveBeenCalledTimes(1);
      });
    });

    describe('TripController_getTravelTrips', () => {
      let request;
      const { response: resMock, mockedTravelTrips } = mocked;

      beforeEach(() => {
        request = {
          body: {
            startDate: '2018-11-15 00:0',
            endDate: '2019-11-15 03:00',
            departmentList: ['People', 'D0 Programs']
          },
          headers: { homebaseid: 1 }
        };

        jest.spyOn(TravelTripService, 'getCompletedTravelTrips').mockResolvedValue(
          mockedTravelTrips.data
        );
      });
      afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      describe('TripController_getTravelTrips_Success', () => {
        it('Should get all Travel trips', async () => {
          await TripsController.getTravelTrips(request, resMock);
          expect(resMock.status).toHaveBeenCalled();
          expect(resMock.status).toHaveBeenCalledWith(200);
        });
      });

      describe('TripController_getRouteTrips', () => {
        const requestQuery = {
          query: { page: 1 },
          headers: { homebaseid: 1 }
        };

        it('should get all route trips', async () => {
          await TripsController.getRouteTrips(requestQuery, res);
          expect(res.status).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return empty array if no records are available', async () => {
          jest.spyOn(RouteUseRecordService, 'getRouteTripRecords')
            .mockResolvedValue({ data: null });
          await TripsController.getRouteTrips(requestQuery, res);

          expect(res.status).toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return error response if error is thrown', async () => {
          RouteUseRecordService.getRouteTripRecords = jest.fn()
            .mockRejectedValue(new Error('network error'));
          jest.spyOn(HttpError, 'sendErrorResponse');
          await TripsController.getRouteTrips(requestQuery, res);
          expect(HttpError.sendErrorResponse).toHaveBeenCalled();
        });
      });
    });
  });
});
