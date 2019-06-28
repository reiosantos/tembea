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
import TravelTripService from '../../../services/TravelTripService';
import SlackProviderHelper from '../../slack/helpers/slackHelpers/ProvidersHelper';
import ProviderNotifications from '../../slack/SlackPrompts/notifications/ProviderNotifications';
import TripHelper from '../../../helpers/TripHelper';

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
  describe('TripController_getTrips', () => {
    it('Should get all trips value', async () => {
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
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.status().json).toHaveBeenCalledTimes(1);
      });
    });

    describe('updateProviderAndNotify', () => {
      beforeEach(async () => {
        jest.spyOn(tripService, 'updateRequest').mockResolvedValue({});
      });

      it('should update provider and notify', async () => {
        const resp = {
          status: jest.fn(() => ({
            json: jest.fn(() => ({
              success: true,
              message: 'The Provider for this trip was updated successfully'
            }))
          }))
        };
        const response = await TripsController.updateProviderAndNotify({}, resp, {});
        expect(resp.status).toHaveBeenCalledTimes(1);
        expect(response).toHaveProperty('success');

        expect(response).toHaveProperty('message');
        expect(response.success).toEqual(true);
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });
    });

    describe('updateTrip() without action', () => {
      beforeEach(() => {
        jest.spyOn(TripHelper, 'tripHasProvider').mockReturnValue(true);
        jest.spyOn(TripsController, 'updateProviderAndNotify').mockResolvedValue({});
        jest
          .spyOn(TripsController, 'getCommonPayloadParam')
          .mockResolvedValue(payload);
        jest
          .spyOn(TripsController, 'getSlackIdFromReq')
          .mockResolvedValue('UG9MG84U8');
      });

      it('should update a trip\'s provider', async () => {
        const request = {
          query: { action: undefined },
          params: { tripId: 1 },
          body: { slackUrl: '', providerId: 1 }
        };
        await TripsController.updateTrip(request, res);
        expect(TripsController.updateProviderAndNotify).toHaveBeenCalled();
      });
    });
  });

  describe('TripController_getTravelTrips', () => {
    let request;
    const { response: res, mockedTravelTrips } = mocked;

    beforeEach(() => {
      request = {
        body: {
          startDate: '2018-11-15 00:0',
          endDate: '2019-11-15 03:00',
          departmentList: ['People', 'D0 Programs']
        }
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
        await TripsController.getTravelTrips(request, res);
        expect(res.status).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.status().json).toHaveBeenCalledWith({
          ...mockedTravelTrips,
          success: true,
          message: 'Request was successful',
        });
      });
    });
  });
});
