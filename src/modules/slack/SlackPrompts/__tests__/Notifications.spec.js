import { IncomingWebhook } from '@slack/client';
import SlackInteractions from '../../SlackInteractions';
import SlackNotifications from '../Notifications';
import models from '../../../../database/models';
import { SlackEvents } from '../../events/slackEvents';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import WebClientSingleton from '../../../../utils/WebClientSingleton';
import NotificationsResponse from '../NotificationsResponse';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import DepartmentService from '../../../../services/DepartmentService';
import RouteRequestService from '../../../../services/RouteRequestService';
import { mockRouteRequestData } from '../../../../services/__mocks__/index';
import Services from '../../../../services/UserService';


const tripInitial = {
  id: 2,
  requestId: null,
  departmentId: 23,
  tripStatus: 'Approved',
  department: null,
  destination: { dataValues: { address: 'Dubai' } },
  origin: { dataValues: { address: 'New York' } },
  pickup: { },
  departureDate: null,
  requestDate: new Date(),
  requester: { dataValues: {} },
  rider: { dataValues: { slackId: 2 } },
};

SlackEvents.raise = jest.fn();

const webClientMock = {
  im: {
    open: () => Promise.resolve({
      channel: { id: '419' }
    })
  },
  users: {
    info: jest.fn(() => Promise.resolve({
      user: { real_name: 'someName', profile: { email: 'someemial@email.com' } },
      token: 'sdf'
    })),
    profile: {
      get: jest.fn(() => Promise.resolve({
        profile: {
          tz_offset: 'someValue',
          email: 'sekito.ronald@andela.com'
        }
      }))
    }
  },
  chat: {
    postMessage: () => Promise.resolve({ data: 'successfully opened chat' })
  }
};

const dbRider = {
  id: 275,
  slackId: '456FDRF',
  name: 'rider Paul',
  phoneNo: null,
  email: 'rider@andela.com',
  defaultDestinationId: null,
  routeBatchId: null,
  createdAt: '2019-03-05T19:32:17.426Z',
  updatedAt: '2019-03-05T19:32:17.426Z'
};

jest.mock('../../../../services/TeamDetailsService', () => ({
  getTeamDetails: jest.fn(() => Promise.resolve({
    botToken: 'just a token',
    webhookConfigUrl: 'just a url',
    opsChannelId: 'S199'
  })),
  getTeamDetailsBotOauthToken: jest.fn(() => Promise.resolve('just a random token'))
}));

describe('SlackNotifications', () => {
  beforeEach(() => {
    const mockUser = { slackId: 3 };
    jest.spyOn(SlackHelpers, 'getHeadByDepartmentId').mockResolvedValue(mockUser);
    jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId').mockResolvedValue(mockUser);
    jest.spyOn(WebClientSingleton.prototype, 'getWebClient').mockReturnValue(webClientMock);
    jest.spyOn(IncomingWebhook.prototype, 'send').mockResolvedValue(true);
    jest.spyOn(Services, 'findOrCreateNewUserWithSlackId').mockResolvedValue(dbRider);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getDMChannelId', () => {
    it('return an id as received from slack', async (done) => {
      const [id, botToken] = ['419', 'hello'];
      jest.spyOn(WebClientSingleton.prototype, 'getWebClient').mockReturnValue(
        {
          im: {
            open: jest.fn().mockResolvedValue({
              channel: { id }
            })
          }
        }
      );

      const channelId = await SlackNotifications.getDMChannelId(undefined, botToken);

      expect(WebClientSingleton.prototype.getWebClient).toBeCalledWith(botToken);
      expect(channelId).toEqual(id);
      done();
    });
  });

  describe('getManagerMessageAttachment', () => {
    const newTripRequest = tripInitial;
    const imResponse = 'hello';
    const requester = { slackId: '112' };
    const rider = {
      slackId: '767',
      name: 'rider Paul',
      phoneNo: null,
      email: 'rider@andela.com',
      defaultDestinationId: null,
      routeBatchId: null,
      createdAt: '2019-03-05T19:32:17.426Z',
      updatedAt: '2019-03-05T19:32:17.426Z'
    };
    const requestType = 'newTrip';
    
    beforeEach(() => {
      jest.spyOn(SlackNotifications, 'createDirectMessage');
    });

    it('should create a message', async (done) => {
      const result = await SlackNotifications.getManagerMessageAttachment(newTripRequest,
        imResponse, requester, 'newTrip', rider);

      expect(result).toBeDefined();
      expect(Services.findOrCreateNewUserWithSlackId).toBeCalledWith(rider);
      expect(SlackNotifications.createDirectMessage).toHaveBeenCalledWith(imResponse, expect.anything(), expect.anything());
     
      const result2 = await SlackNotifications.getManagerMessageAttachment(newTripRequest,
        imResponse, requester, 'notNew', rider);
      expect(result2).toBeDefined();

      done();
    });

    it('should add notification actions when tripStatus is pending', async (done) => {
      jest.spyOn(SlackNotifications, 'notificationActions');
      newTripRequest.tripStatus = 'Pending';

      const result = await SlackNotifications.getManagerMessageAttachment(newTripRequest,
        imResponse, requester, requestType, rider);

      expect(SlackNotifications.notificationActions).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      done();
    });
  });

  describe('sendManagerTripRequestNotification', () => {
    it('should fail when departmentId is wrong', async (done) => {
      jest.spyOn(SlackHelpers, 'getHeadByDepartmentId').mockRejectedValue(true);
      const tripInfo = {
        departmentId: 100,
        requestedById: 100,
        id: 100
      };
      const payload = {
        team: { id: 'HAHJDILYR' }
      };
      const response = jest.fn();

      await SlackNotifications.sendManagerTripRequestNotification(payload, tripInfo, response);

      expect(response).toBeCalledWith({
        text: 'Error:warning:: Request saved, but I could not send a notification to your manager.'
      });
      done();
    });
  });

  describe('sendNotification', () => {
    it('should send notification', async (done) => {
      const res = await SlackNotifications.sendNotification(
        { channel: { id: 'XXXXXX' } },
        {},
        'some text'
      );

      expect(res).toEqual({
        data: 'successfully opened chat'
      });
      done();
    });
  });

  describe('sendRequesterDeclinedNotification', () => {
    it('should send error on decline', async (done) => {
      jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId').mockRejectedValue();

      const tripInfo = {
        departmentId: 6,
        requestedById: 1000,
        declinedById: 6,
        origin: {
          dataValues: {
            address: 'Someplace'
          }
        },
        destination: {
          dataValues: {
            address: 'Someplace'
          }
        },
        id: 3
      };
      const response = jest.fn();
      const responseData = {
        text: 'Error:warning:: Decline saved but requester will not get the notification'
      };
      await SlackNotifications.sendRequesterDeclinedNotification(tripInfo, response);
      expect(response).toBeCalledWith(responseData);
      done();
    });

    it('should send decline notification', async (done) => {
      const tripInfo = {
        departmentId: 6,
        requestedById: 6,
        declinedById: 6,
        rider: {
          dataValues:
           {
             name: 'Derrick Kirwa'
           }
        },
        origin: {
          dataValues: {
            address: 'Someplace'
          }
        },
        destination: {
          dataValues: {
            address: 'Someplace'
          }
        },
        id: 3
      };

      jest.spyOn(SlackNotifications, 'getDMChannelId').mockReturnValue(123);
      jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
      await SlackNotifications.sendRequesterDeclinedNotification(
        tripInfo,
        () => {}
      );

      expect(SlackNotifications.sendNotification).toBeCalledTimes(1);
      done();
    });
  });

  describe('sendManagerConfirmOrDeclineNotification', () => {
    it('should send manager notification', async () => {
      const tripInfo = {
        department: {
          dataValues: {
            headId: 3,
          }
        },
        rider: {
          dataValues: {
            slackId: 3,
          }
        },
        origin: {
          dataValues: {
            address: 'never land',
          }
        },
        destination: {
          dataValues: {
            address: 'never land',
          }
        },
        cab: {
          dataValues: {
            driverName: 'Sunday',
            driverPhoneNo: '001001001',
            regNumber: '1928dfsgg'
          }
        }
      };
      const [userId, teamId] = [3, 'HAHJDILYR'];
      const declineStatus = false;
      jest.spyOn(SlackNotifications, 'sendNotifications').mockResolvedValue();

      await SlackNotifications.sendManagerConfirmOrDeclineNotification(
        teamId, userId, tripInfo, declineStatus
      );

      expect(SlackNotifications.sendNotifications).toBeCalledTimes(1);
    });

    it('should send manager confirmation notification', async () => {
      const tripInfo = {
        department: {
          dataValues: {
            headId: 3,
          }
        },
        rider: {
          dataValues: {
            slackId: 3,
          }
        },
        origin: {
          dataValues: {
            address: 'never land',
          }
        },
        destination: {
          dataValues: {
            address: 'never land',
          }
        },
        cab: {
          dataValues: {
            driverName: 'Dave',
            driverPhoneNo: '6789009876',
            regNumber: 'JK 321 LG'
          }
        }
      };

      const payload = {
        user: { id: 3 },
        team: { id: 'HAHJDILYR' },
        submission: {
          driverName: 'driverName', driverPhoneNo: 'driverPhoneNo', regNumber: 'regNumber'
        }
      };
      const { user: { id: userId }, team: { id: teamId } } = payload;
      const declineStatus = true;
      const res = await SlackNotifications.sendManagerConfirmOrDeclineNotification(
        teamId, userId, tripInfo, declineStatus
      );
      expect(res).toEqual(undefined);
    });
  });

  describe('sendManagerTripRequestNotification', () => {
    it('should send the manager a notification', async (done) => {
      const tripInfo = {
        departmentId: 3,
        requestedById: 6,
        id: 3,
      };
      const payload = {
        team: { id: 'HAHJDILYR' }
      };
      const head = {
        email: 'AAAAAA',
        slackId: 'AAAAAA',
      };
      const rider = {
        ...head
      };

      const findUserByIdOrSlackId = jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId');
      findUserByIdOrSlackId.mockReturnValueOnce(rider);
      findUserByIdOrSlackId.mockReturnValueOnce({ ...rider, slackId: 'BBBBBB' });

      jest.spyOn(SlackHelpers, 'getHeadByDepartmentId').mockResolvedValue(head);
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue();
      jest.spyOn(SlackNotifications, 'getManagerMessageAttachment').mockResolvedValue();
      jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue(
        { message: 'mockMessageToSlack' }
      );

      const res = await SlackNotifications.sendManagerTripRequestNotification(
        payload, tripInfo, () => {}
      );
      expect(res).toEqual({ message: 'mockMessageToSlack' });
      done();
    });
  });

  describe('sendWebhookPushMessage', () => {
    it('should call IncomingWebhook send method', async (done) => {
      const [webhookUrl, message] = ['https://hello.com', 'Welcome to tembea'];

      const result = await SlackNotifications.sendWebhookPushMessage(webhookUrl, message);

      expect(IncomingWebhook.prototype.send).toHaveBeenCalledWith(message);
      expect(result).toBeTruthy();
      done();
    });
  });

  describe('User Notification', () => {
    const tripInfo = {
      requester: {
        dataValues: {
          slackId: 3,
        }
      },
      rider: {
        dataValues: {
          slackId: 3,
        }
      },
      origin: {
        dataValues: {
          address: 'never land',
        }
      },
      destination: {
        dataValues: {
          address: 'never land',
        }
      },
      cab: {
        dataValues: {
          driverName: 'Dave',
          driverPhoneNo: '6789009876',
          regNumber: 'JK 321 LG'
        }
      }
    };
    const declineStatusFalse = false;
    const declineStatusTrue = true;
    const payload = {
      user: { id: 3 },
      team: { id: 'HAHJDILYR' },
      submission: {
        driverName: 'driverName', driverPhoneNo: 'driverPhoneNo', regNumber: 'regNumber'
      }
    };

    const { user: { id: userId }, team: { id: teamId } } = payload;
    it('should send user notification when requester is equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 3;
      const res = await SlackNotifications.sendUserConfirmOrDeclineNotification(teamId, userId, tripInfo, declineStatusFalse);
      expect(res).toEqual(undefined);
    });

    it('should send user notification when requester is not equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 4;
      const res = await SlackNotifications.sendUserConfirmOrDeclineNotification(
        teamId, userId, tripInfo, declineStatusFalse
      );
      expect(res).toEqual(undefined);
    });

    it('should send user confirmation notification when requester is equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 3;
      const res = await SlackNotifications.sendUserConfirmOrDeclineNotification(
        teamId, userId, tripInfo, declineStatusTrue
      );
      expect(res).toEqual(undefined);
    });

    it('should send user confirmation notification when requester is not equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 4;
      const res = await SlackNotifications.sendUserConfirmOrDeclineNotification(teamId, userId, tripInfo, declineStatusTrue);
      expect(res).toEqual(undefined);
    });
  });

  describe('sendRequesterApprovedNotification', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    let sendNotification;
    let findSelectedDepartment;
    let responseForRequester;
    beforeEach(() => {
      findSelectedDepartment = jest.spyOn(SlackHelpers, 'getHeadByDepartmentId');
      responseForRequester = jest.spyOn(NotificationsResponse, 'responseForRequester');
      sendNotification = jest.spyOn(SlackNotifications, 'sendNotification');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should successfully send approve notification to requester', async () => {
      const fn = () => ({});
      // mock dependencies
      findSelectedDepartment.mockImplementationOnce(() => ({ dataValues: { name: 'Tembea' } }));
      responseForRequester.mockImplementationOnce(fn);
      sendNotification.mockImplementationOnce(fn);

      const responseData = { ...tripInitial, requester: { slackId: 2 } };
      await SlackNotifications
        .sendRequesterApprovedNotification(responseData, jest.fn(), 'slackBotOauthToken');

      expect(findSelectedDepartment).toHaveBeenCalledTimes(1);
      expect(responseForRequester).toHaveBeenCalledTimes(1);
      expect(sendNotification).toHaveBeenCalledTimes(1);
    });
    it('should handle error', async () => {
      // mock dependencies
      const error = new Error('Dummy error message');
      findSelectedDepartment.mockImplementationOnce(() => Promise.reject(error));

      const responseData = { ...tripInitial, requester: { slackId: 2 } };
      const respond = jest.fn();
      await SlackNotifications
        .sendRequesterApprovedNotification(responseData, respond, 'slackBotOauthToken');

      expect(findSelectedDepartment).toHaveBeenCalledTimes(1);
      expect(respond).toHaveBeenCalledTimes(1);
      expect(responseForRequester).not.toHaveBeenCalled();
      expect(sendNotification).not.toHaveBeenCalled();
    });
    it('should return undefined if department is null', async () => {
      // mock dependencies
      findSelectedDepartment.mockImplementationOnce(() => null);

      const responseData = { ...tripInitial, requester: { slackId: 2 } };
      const respond = jest.fn();
      await SlackNotifications
        .sendRequesterApprovedNotification(responseData, respond, 'slackBotOauthToken');

      expect(findSelectedDepartment).toHaveBeenCalledTimes(1);
      expect(respond).not.toHaveBeenCalled();
      expect(responseForRequester).not.toHaveBeenCalled();
      expect(sendNotification).not.toHaveBeenCalled();
    });
  });

  describe('sendOperationsTripRequestNotification', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    const fn = () => {};
    const payload = {
      team: { id: 'AHDJDLKUER' },
      user: { id: 'AHDJDLKUER' }
    };

    let respond;
    let getTripRequest;
    let getTeamDetails;
    let getDepartment;
    let sendRequesterApprovedNotification;
    let sendNotification;
    beforeEach(() => {
      respond = jest.fn(value => value);
      getTripRequest = jest.spyOn(SlackHelpers, 'getTripRequest');
      getTeamDetails = jest.spyOn(TeamDetailsService, 'getTeamDetails');
      getDepartment = jest.spyOn(DepartmentService, 'getDepartment');
      sendNotification = jest.spyOn(SlackNotifications, 'sendNotification');
      sendRequesterApprovedNotification = jest.spyOn(SlackNotifications,
        'sendRequesterApprovedNotification');

      getTripRequest.mockImplementationOnce(() => ({
        createdAt: '',
        departureTime: '',
        rider: { dataValues: { slackId: 1 } },
        requester: { dataValues: { slackId: 1 } },
        destination: { dataValues: {} },
        origin: { dataValues: {} },
        tripDetail: { dataValues: {} },
        departmentId: 1,
        id: 2,
        tripStatus: 'ca'
      }));
      sendRequesterApprovedNotification.mockImplementationOnce(fn);
      const department = { name: 'Tembea DTP' };
      getDepartment.mockImplementationOnce(() => (
        { dataValues: { department }, department }
      ));
      getTeamDetails.mockImplementationOnce(() => (
        { botToken: 'slackBotOauthToken', opsChannelId: 1 }
      ));
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should notify ops on manager\'s approval', async () => {
      sendNotification.mockImplementationOnce(fn);
      await SlackNotifications.sendOperationsTripRequestNotification(23, payload, respond);
      expect(sendNotification).toHaveBeenCalledTimes(1);
      expect(respond).not.toHaveBeenCalled();
    });

    it('should throw an error when accessing dataValues form non existing dept', async () => {
      sendNotification.mockImplementationOnce(() => Promise.reject());
      await SlackNotifications.sendOperationsTripRequestNotification(
        23, payload, respond, 'not-regular'
      );
      expect(sendNotification).toHaveBeenCalledTimes(1);
      expect(respond).toHaveBeenCalledTimes(1);
    });
  });

  describe('SlackNotifications Tests: Manager approval', () => {
    const { TripRequest, User, Department } = models;

    beforeEach(() => {
      jest.spyOn(TripRequest, 'findByPk').mockResolvedValue({ dataValues: tripInitial });
      jest.spyOn(User, 'findOne').mockResolvedValue({ dataValues: { id: 45 } });
      jest.spyOn(Department, 'findByPk').mockResolvedValue({
        dataValues: { head: { dataValues: {} } }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });


    it('Handle manager approve details request and throw an error', async (done) => {
      const payload = {
        actions: [{ name: 'managerApprove' }],
        user: {},
        submission: {}
      };
      const manager = await SlackInteractions.handleManagerApprovalDetails(payload, jest.fn);
      expect(manager).toEqual(undefined);
      done();
    });


    it('Handle manager approve details request but fail to approve', async (done) => {
      const payload = {
        actions: [{ name: 'manager_approve' }],
        user: {},
        submission: {}
      };
      const manager = await SlackInteractions.handleManagerApprovalDetails(payload, jest.fn);
      expect(manager).toEqual(undefined);
      done();
    });
  });

  describe('SlackNotifications: receive new route request', () => {
    let getTeamDetails;
    let routeRequestDetails;
    beforeEach(() => {
      getTeamDetails = jest.spyOn(TeamDetailsService, 'getTeamDetails');
      getTeamDetails.mockImplementationOnce(() => (
        { botToken: 'slackBotOauthToken', opsChannelId: 1 }
      ));
      routeRequestDetails = jest.spyOn(RouteRequestService, 'getRouteRequest');
      routeRequestDetails.mockImplementation(() => ({
        distance: 2,
        busStopDistance: 3,
        routeImageUrl: 'image',
        busStop: { address: 'busstop' },
        home: { address: 'home' },
        manager: { slackId: '1234' },
        engagement: {
          partner: { name: 'partner' },
          startDate: '11-12-2018',
          endDate: '11-12-2019',
          workHours: '10:00-22:00',
          fellow: { slackId: '4321' }
        }
      }));
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    it('should send route request to ops channel', async () => {
      const teamId = 'AHDJDLKUER';
      jest.spyOn(RouteRequestService, 'getRouteRequest')
        .mockResolvedValue(mockRouteRequestData);
      jest.spyOn(TeamDetailsService, 'getTeamDetails')
        .mockResolvedValue({ botToken: 'AAAAAA', opsChannelId: 'BBBBBB' });
      jest.spyOn(SlackNotifications, 'sendOperationsNotificationFields');
      jest.spyOn(SlackNotifications, 'sendNotifications')
        .mockResolvedValue();
      await SlackNotifications.sendOperationsNewRouteRequest(teamId, '1');
      expect(SlackNotifications.sendOperationsNotificationFields)
        .toHaveBeenCalledWith(mockRouteRequestData);
      expect(SlackNotifications.sendNotifications).toHaveBeenCalledTimes(1);
    });
  });
});
