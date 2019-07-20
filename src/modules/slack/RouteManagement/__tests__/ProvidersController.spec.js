import RouteRequestService from '../../../../services/RouteRequestService';
import { mockRouteRequestData } from '../../../../services/__mocks__';
import ProviderNotifications from '../../SlackPrompts/notifications/ProviderNotifications/index';
import ProvidersController from '../ProvidersController';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import ConfirmRouteUseJob from '../../../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import RouteService from '../../../../services/RouteService';
import {
  providersPayload,
  state,
  route,
  cab,
  reassignCabPayload,
  reassignDriverPayload,
  user,
  driver,
  routeData,
  SlackAttachment
} from '../__mocks__/providersController.mock';
import { driverService } from '../../../../services/DriverService';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import SlackNotifications from '../../SlackPrompts/Notifications';
import ProviderService from '../../../../services/ProviderService';

describe('Provider Controller', () => {
  let respond;
  let getRouteRequestAndToken;
  let payload;
  let completeProviderApprovedAction;
  let updateRouteRequest;
  beforeEach(() => {
    respond = jest.fn();
    getRouteRequestAndToken = jest.spyOn(RouteRequestService, 'getRouteRequestAndToken');
    updateRouteRequest = jest.spyOn(RouteRequestService, 'updateRouteRequest');
    completeProviderApprovedAction = jest.spyOn(
      ProviderNotifications, 'completeProviderApprovedAction'
    );
    jest.spyOn(ProvidersController, 'getFinalCabSubmissionDetails');
    payload = { ...providersPayload, state };
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should complete approve action if a cab and a driver is assigned by provider', async () => {
    getRouteRequestAndToken.mockResolvedValueOnce({
      routeRequest: { ...mockRouteRequestData },
      slackBotOauthToken: 'dfdf'
    });
    jest.spyOn(ProvidersController, 'saveRoute').mockResolvedValue();
    updateRouteRequest.mockResolvedValueOnce({
      ...mockRouteRequestData,
      status: 'Approved',
      opsComment: 'approved'
    });
    completeProviderApprovedAction.mockReturnValue('Token');
    await ProvidersController.handleProvidersRouteApproval(payload, respond);
    expect(RouteRequestService.getRouteRequestAndToken).toBeCalled();
    expect(RouteRequestService.updateRouteRequest).toHaveBeenCalled();
    expect(ProvidersController.getFinalCabSubmissionDetails).toBeCalled();
    expect(ProvidersController.saveRoute).toHaveBeenCalled();
    expect(ProviderNotifications.completeProviderApprovedAction).toHaveBeenCalled();
  });
  it('should save route', async () => {
    jest.spyOn(RouteService, 'createRouteBatch').mockResolvedValue({});
    jest.spyOn(ConfirmRouteUseJob, 'scheduleBatchStartJob').mockResolvedValue({});
    jest.spyOn(RouteService, 'addUserToRoute').mockResolvedValue({});

    await ProvidersController.saveRoute(mockRouteRequestData, payload, 1);

    expect(RouteService.addUserToRoute).toBeCalled();
    expect(ConfirmRouteUseJob.scheduleBatchStartJob).toHaveBeenCalled();
    expect(RouteService.createRouteBatch).toBeCalled();
  });
  it('should get the final submission', async () => {
    const vehicleData = {
      cab: 'TTTT, 789,ghvds',
      driver: '1, fgghvhb, 9876546789,1242342424',
      regNumber: 'sdsdds',
      routeCapacity: 2,
      driverId: 1
    };
    const result = await ProvidersController.getFinalCabSubmissionDetails(vehicleData);
    expect(result).toEqual({
      driverId: '1',
      driverName: ' fgghvhb',
      driverNumber: '1242342424',
      driverPhoneNumber: ' 9876546789',
      regNumber: 'ghvds',
      routeCapacity: 'TTTT'
    });
  });
  it('should throw an error', async () => {
    getRouteRequestAndToken.mockRejectedValueOnce('an error');
    jest.spyOn(bugsnagHelper, 'log');
    completeProviderApprovedAction.mockReturnValueOnce('Token');
    await ProvidersController.handleProvidersRouteApproval(payload, respond);
    expect(bugsnagHelper.log).toHaveBeenCalled();
    expect(respond.mock.calls[0][0].text).toEqual('Unsuccessful request. Kindly Try again');
  });

  describe('reassigned cab', () => {
    beforeEach(() => {
      jest.spyOn(RouteService, 'updateRouteBatch').mockResolvedValue(route);
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('moon-token');
      jest.spyOn(ProviderNotifications, 'updateProviderReAssignCabMessage').mockResolvedValue({});
      jest.spyOn(ProvidersController, 'sendUserUpdatedRouteMessage').mockResolvedValue({});
    });
    afterEach(async () => {
      jest.restoreAllMocks();
    });
  
    it('should reassign a cab to route', async () => {
      await ProvidersController.handleCabReAssigmentNotification(reassignCabPayload);
      expect(ProviderNotifications.updateProviderReAssignCabMessage).toHaveBeenCalled();
      expect(ProvidersController.sendUserUpdatedRouteMessage).toHaveBeenCalled();
    });
  
    it('should fail when reassigning a cab to a route', async () => {
      respond = jest.fn;
      jest.spyOn(bugsnagHelper, 'log');
      jest.spyOn(ProviderNotifications, 'updateProviderReAssignCabMessage').mockRejectedValue();
      await ProvidersController.handleCabReAssigmentNotification(reassignCabPayload, respond);
      expect(bugsnagHelper.log).toHaveBeenCalled();
    });
  });

  describe('Send new cab details to user', () => {
    it('should send user update notification', async () => {
      jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('moooon');
      jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
      await ProvidersController.sendUserUpdatedRouteMessage(user, route, cab, 'moon-token');
      expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
      expect(SlackNotifications.sendNotification).toHaveBeenCalled();
    });
  });
});

describe('reassignDriver', () => {
  beforeEach(() => {
    jest.spyOn(RouteService, 'updateRouteBatch').mockResolvedValue(route);
    jest.spyOn(driverService, 'getDriverById').mockResolvedValue();
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('xoop-token');
    jest.spyOn(ProviderNotifications, 'updateProviderReasignDriverMessage').mockResolvedValue({});
    jest.spyOn(ProvidersController, 'sendUserRouteUpdateMessage').mockResolvedValue({});
  });
  afterEach(async () => {
    jest.restoreAllMocks();
  });
  it('Should reassign driver to a route', async () => {
    jest.spyOn(ProviderNotifications, 'updateProviderReasignDriverMessage').mockResolvedValue({});
    await ProvidersController.providerReassignDriver(reassignDriverPayload);
    expect(ProviderNotifications.updateProviderReasignDriverMessage).toHaveBeenCalled();
    expect(ProvidersController.sendUserRouteUpdateMessage).toHaveBeenCalled();
  });
  it('Should enter catch block', async () => {
    jest.spyOn(bugsnagHelper, 'log');
    jest.spyOn(ProviderNotifications, 'updateProviderReasignDriverMessage').mockRejectedValue();
    await ProvidersController.providerReassignDriver(reassignDriverPayload);
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});

describe('Send user notification', () => {
  it('Should send user update notification', async () => {
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('xxxoop');
    jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();

    await ProvidersController.sendUserRouteUpdateMessage(user, route, driver, 'xoob-try');
    expect(SlackNotifications.getDMChannelId).toHaveBeenCalled();
    expect(SlackNotifications.sendNotification).toHaveBeenCalled();
  });
});

describe('handleProviderRouteApproval', () => {
  let userMessageSpy;
  let OpsMessageSpy;
  let updateProviderMessageSpy;
  beforeEach(() => {
    jest.spyOn(ProviderService, 'findProviderByPk').mockResolvedValue({ name: 'adaeze' });
    jest.spyOn(TeamDetailsService, 'getTeamDetails').mockResolvedValue({
      botToken: 'xoop', opsChannelId: 'UXXID'
    });
    jest.spyOn(RouteService, 'updateRouteBatch').mockResolvedValue(routeData);
    userMessageSpy = jest.spyOn(
      ProvidersController, 'sendUserProviderAssignMessage'
    ).mockResolvedValue();
    OpsMessageSpy = jest.spyOn(
      ProvidersController, 'sendOpsProviderAssignMessage'
    ).mockResolvedValue();
    updateProviderMessageSpy = jest.spyOn(
      ProviderNotifications, 'updateRouteApprovalNotification'
    ).mockResolvedValue();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should handle provider aproval', async () => {
    const payload = {
      team: { id: 'teamId' },
      submission: { driver: '2, adaeze, 09090909, ', cab: '1, 4, sabaru, xxb' },
      state: '{ "tripId": "1", "channel": "UXXID", "timestamp": "123456789" }'
    };
    await ProvidersController.handleProviderRouteApproval(payload);
    expect(userMessageSpy).toHaveBeenCalled();
    expect(OpsMessageSpy).toHaveBeenCalled();
    expect(updateProviderMessageSpy).toHaveBeenCalled();
  });
});

describe('sendOpsProviderAssignMessage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('Should send ops provider approval message', async () => {
    jest.spyOn(SlackNotifications, 'createDirectMessage').mockResolvedValue();
    jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
    await ProvidersController.sendOpsProviderAssignMessage(
      'deeCabs', 'bay-area', 'XOOP', 'UXXID', SlackAttachment
    );
    expect(SlackNotifications.createDirectMessage).toHaveBeenCalled();
    expect(SlackNotifications.sendNotification).toHaveBeenCalled();
  });
});

describe('sendUserProviderAssignMessage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('Should send users provider assign message', async () => {
    const message = 'A driver and cab has been assigned to your route "*bay area*". :smiley:';
    jest.spyOn(SlackNotifications, 'createDirectMessage').mockResolvedValue();
    jest.spyOn(SlackNotifications, 'sendNotification').mockResolvedValue();
    jest.spyOn(SlackNotifications, 'getDMChannelId').mockResolvedValue('UPMX1');
    await ProvidersController.sendUserProviderAssignMessage(
      routeData.riders, 'xoop', 'bay area', SlackAttachment
    );
    expect(SlackNotifications.createDirectMessage).toHaveBeenCalledWith('UPMX1', message, [SlackAttachment]);
    expect(SlackNotifications.sendNotification).toHaveBeenCalled();
  });
});
