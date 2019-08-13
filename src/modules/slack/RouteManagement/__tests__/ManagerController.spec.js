import ManagerController from '../ManagerController';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import ManagerNotifications from '../../SlackPrompts/notifications/ManagerRouteRequest';
import RouteRequestService from '../../../../services/RouteRequestService';
import { mockRouteRequestData } from '../../../../services/__mocks__';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import ManagerFormValidator
  from '../../../../helpers/slack/UserInputValidator/managerFormValidator';
import { SlackEvents } from '../../events/slackEvents';
import { SlackDialogError } from '../../SlackModels/SlackDialogModels';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import PartnerService from '../../../../services/PartnerService';
import Cache from '../../../../cache';
import RouteHelper from '../../../../helpers/RouteHelper';

describe('Manager Route controller', () => {
  const dummyFunction = () => ({});
  let respond;
  beforeEach(() => {
    respond = jest.fn();
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken')
      .mockReturnValue('token');
    const engagementData = ['12/01/2018', '12/12/2022', 'Safaricom'];
    jest.spyOn(Cache, 'fetch').mockResolvedValue(engagementData);
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('manager actions', () => {
    let payload;
    let getRouteRequest;
    let completeManagerAction;
    let updateRouteRequest;
    let routeRequestId;
    let timeStamp;
    let channelId;
    let approve;
    beforeEach(() => {
      getRouteRequest = jest.spyOn(RouteRequestService, 'getRouteRequest');
      updateRouteRequest = jest.spyOn(RouteHelper, 'updateRouteRequest');
      completeManagerAction = jest.spyOn(ManagerNotifications, 'completeManagerAction');
      payload = {
        submission: {
          declineReason: 'QQQQQQ', startDate: '31/01/2019', endDate: '20/02/2019'
        },
        actions: [{ name: 'action', value: 'routeRequestId' }],
        channel: { id: 1 },
        team: { id: 1 },
        user: { id: 1 },
        original_message: { ts: 'timestamp' }
      };
      ({ channel: { id: channelId }, original_message: { ts: timeStamp } } = payload);
      ({ id: routeRequestId } = mockRouteRequestData);
      approve = {
        timeStamp, channelId, routeRequestId
      };
    });
    describe('decline', () => {
      beforeEach(() => {
        payload = { ...payload, callback_id: 'manager_route_decline', };
        jest.spyOn(DialogPrompts, 'sendReasonDialog')
          .mockImplementation(() => ({}));
      });
      it('should launch decline dialog prompt', async () => {
        getRouteRequest.mockReturnValue(mockRouteRequestData);
        await ManagerController.handleManagerActions(payload, respond);
        expect(DialogPrompts.sendReasonDialog).toHaveBeenCalledTimes(1);
      });
      it('should not launch decline dialog prompt, request has been approved or declined',
        async () => {
          completeManagerAction.mockReturnValue('token');

          const validateStatus = jest.spyOn(ManagerFormValidator, 'validateStatus');

          getRouteRequest.mockReturnValueOnce({ ...mockRouteRequestData, status: 'Declined' });
          getRouteRequest.mockReturnValueOnce({ ...mockRouteRequestData, status: 'Confirmed' });

          await ManagerController.handleManagerActions(payload, respond);
          expect(validateStatus).toHaveBeenCalledWith({
            ...mockRouteRequestData, status: 'Declined'
          }, 'pending');
          await ManagerController.handleManagerActions(payload, respond);
          expect(validateStatus).toHaveBeenCalledWith({
            ...mockRouteRequestData, status: 'Confirmed'
          }, 'pending');
          expect(completeManagerAction).toHaveBeenCalledTimes(2);
        });
    });
    describe('approve', () => {
      beforeEach(() => {
        payload = {
          submission: {
            declineReason: 'QQQQQQ',
            startDate: '31/01/2019',
            endDate: '20/02/2019'
          },
          actions: [{ name: 'action', value: 'routeRequestId' }],
          channel: { id: 1 },
          team: { id: 1 },
          user: { id: 1 },
          original_message: { ts: 'timestamp' },
          callback_id: 'manager_route_approve'
        };
        jest.spyOn(DialogPrompts, 'sendReasonDialog')
          .mockImplementation(() => ({}));
      });
      it('should launch engagement information dialog', async () => {
        getRouteRequest.mockReturnValue(mockRouteRequestData);
        await ManagerController.handleManagerActions(payload, respond);
        expect(DialogPrompts.sendReasonDialog).toHaveBeenCalledTimes(1);
      });
      it('should not launch decline dialog prompt, request has been approved or declined',
        async () => {
          jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken')
            .mockReturnValue('token');
          completeManagerAction.mockReturnValue('token');

          const validateStatus = jest.spyOn(ManagerFormValidator, 'validateStatus');

          getRouteRequest.mockReturnValueOnce({ ...mockRouteRequestData, status: 'Declined' });
          getRouteRequest.mockReturnValueOnce({ ...mockRouteRequestData, status: 'Confirmed' });

          await ManagerController.handleManagerActions(payload, respond);
          expect(validateStatus).toHaveBeenCalledWith({
            ...mockRouteRequestData, status: 'Declined'
          }, 'pending');
          await ManagerController.handleManagerActions(payload, respond);
          expect(validateStatus).toHaveBeenCalledWith({
            ...mockRouteRequestData, status: 'Confirmed'
          }, 'pending');
          expect(completeManagerAction).toHaveBeenCalledTimes(2);
        });
    });
    describe('manager declined request', () => {
      beforeEach(() => {
        payload = {
          ...payload,
          callback_id: 'manager_route_declinedRequest',
        };
        const fn = () => ({});
        const state = JSON.stringify({
          decline: {
            timeStamp, channelId, routeRequestId
          }
        });
        payload = { ...payload, state };
        updateRouteRequest.mockReturnValue({ ...mockRouteRequestData, status: 'Declined' });
        completeManagerAction.mockReturnValue('token');
        jest.spyOn(SlackEvents, 'raise')
          .mockImplementation(fn);
        jest.spyOn(DialogPrompts, 'sendEngagementInfoDialogToManager')
          .mockImplementation(fn);
        getRouteRequest.mockReturnValue(mockRouteRequestData);
      });
      it('should send fellow a decline notification and update managers notification message',
        async () => {
          await ManagerController.handleManagerActions(payload, respond);

          expect(SlackEvents.raise).toHaveBeenCalled();
          expect(ManagerNotifications.completeManagerAction).toHaveBeenCalled();
          expect(updateRouteRequest).toHaveBeenCalled();

          const mockedCalls = updateRouteRequest.mock.calls;
          expect(mockedCalls[0][0]).toEqual(mockRouteRequestData.id);
          expect(mockedCalls[0][1].status).toEqual('Declined');
          expect(mockedCalls[0][1].managerComment)
            .toEqual(payload.submission.declineReason);
        });
      it('should return slack dialog error when invalid reason is provided', async () => {
        payload = { ...payload, submission: { declineReason: '                   ' } };
        const result = await ManagerController.handleManagerActions(payload, respond);
        expect(result.errors[0]).toBeInstanceOf(SlackDialogError);
        expect(updateRouteRequest).not.toHaveBeenCalled();
      });
    });
    describe('preview approval', () => {
      beforeEach(() => {
        payload = {
          ...payload,
          callback_id: 'manager_route_approvedRequestPreview',
        };

        const state = JSON.stringify({
          approve
        });
        payload = { ...payload, state };
        jest.spyOn(InteractivePrompts, 'messageUpdate').mockImplementation(dummyFunction);

        getRouteRequest.mockReturnValue(mockRouteRequestData);
      });
      it('should display a preview of the approval', async () => {
        await ManagerController.handleManagerActions(payload, respond);
        expect(InteractivePrompts.messageUpdate).toHaveBeenCalled();
      });
    });
    describe('submit manager approval', () => {
      it('should raise an event to send ops and fellow notification', async () => {
        updateRouteRequest.mockReturnValue({ ...mockRouteRequestData, status: 'Confirmed' });
        completeManagerAction.mockReturnValue('token');
        getRouteRequest.mockReturnValue(mockRouteRequestData);

        jest.spyOn(SlackEvents, 'raise').mockImplementation(dummyFunction);
        jest.spyOn(PartnerService, 'updateEngagement').mockImplementation(dummyFunction);
        const value = JSON.stringify({
          approve,
          ...payload.submission
        });
        payload = {
          ...payload,
          actions: [{ value, name: 'approvedRequestSubmit' }],
          callback_id: 'manager_route_btnActions',
        };
        await ManagerController.handleManagerActions(payload, respond);
        expect(SlackEvents.raise).toHaveBeenCalled();
      });
    });
    describe('initial notification', () => {
      it('should display initial notification to manager', async () => {
        const value = JSON.stringify({
          data: {
            timeStamp, channelId, routeRequestId
          },
        });
        payload = {
          ...payload,
          actions: [{ value, name: 'initialNotification' }],
          callback_id: 'manager_route_btnActions',
        };
        getRouteRequest.mockReturnValue(mockRouteRequestData);
        jest.spyOn(InteractivePrompts, 'messageUpdate').mockReturnValue();
        await ManagerController.handleManagerActions(payload, respond);
      });
    });
  });

  describe('handle manager actions', () => {
    let mockHandler;
    let payload;
    beforeEach(() => {
      payload = { actions: [{ name: 'action' }], callback_id: 'dummy_callback_btnActions' };
      mockHandler = jest.fn().mockReturnValue({ test: 'dummy test' });
      jest.spyOn(ManagerController, 'managerRouteController')
        .mockImplementation(() => mockHandler);
    });
    it('should properly handle route actions', async () => {
      payload = { ...payload, callback_id: 'dummy_callback_id' };
      const result = await ManagerController.handleManagerActions(payload, respond);
      expect(ManagerController.managerRouteController).toHaveBeenCalledWith('id');
      expect(mockHandler).toHaveBeenCalledWith(payload, respond);
      expect(result).toEqual({ test: 'dummy test' });
    });
    it('should properly slack button actions', async () => {
      const result = await ManagerController.handleManagerActions(payload, respond);
      expect(ManagerController.managerRouteController).toHaveBeenCalledWith('action');
      expect(mockHandler).toHaveBeenCalledWith(payload, respond);
      expect(result).toEqual({ test: 'dummy test' });
    });
    it('should properly handle errors', async () => {
      payload = { ...payload, callback_id: null };
      jest.spyOn(bugsnagHelper, 'log');
      await ManagerController.handleManagerActions(payload, respond);
      expect(bugsnagHelper.log).toHaveBeenCalledTimes(1);
      expect(respond).toHaveBeenCalledTimes(1);
    });
  });
  describe('manager route controller', () => {
    it('should return a function if action exist', () => {
      const result = ManagerController.managerRouteController('approve');
      expect(result).toBeInstanceOf(Function);
    });
    it('should throw an error if action does exist', () => {
      try {
        ManagerController.managerRouteController('doesNotExist')();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Unknown action: manager_route_doesNotExist');
      }
    });
  });
});
