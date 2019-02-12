import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import RouteRequestService from '../../../../services/RouteRequestService';
import OperationsController from '../OperationsController';
import { mockRouteRequestData } from '../../../../services/__mocks__';
import { SlackDialogError } from '../../SlackModels/SlackDialogModels';
import OperationsNotifications from '../../SlackPrompts/notifications/OperationsRouteRequest';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import ManagerFormValidator
  from '../../../../helpers/slack/UserInputValidator/managerFormValidator';

describe('Operations Route Controller', () => {
  let respond;
  const fn = () => ({});
  beforeEach(() => {
    respond = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('operations actions', () => {
    let payload;
    let getRouteRequestAndToken;
    let completeOperationsApprovedAction;
    let updateRouteRequest;
    let routeRequestId;
    let timeStamp;
    let channelId;

    beforeEach(() => {
      getRouteRequestAndToken = jest.spyOn(RouteRequestService, 'getRouteRequestAndToken');
      updateRouteRequest = jest.spyOn(RouteRequestService, 'updateRouteRequest');
      completeOperationsApprovedAction = jest.spyOn(
        OperationsNotifications, 'completeOperationsApprovedAction'
      );
      payload = {
        submission: {
          declineReason: 'QQQQQQ', startDate: '31/01/2019', endDate: '20/02/2019'
        },
        actions: [{ name: 'action', value: 'routeRequestId' }],
        channel: { id: 1 },
        team: { id: 1 },
        original_message: { ts: 'timestamp' },
        user: { id: '4' }
      };
      ({ channel: { id: channelId }, original_message: { ts: timeStamp } } = payload);
      ({ id: routeRequestId } = mockRouteRequestData);
    });

    describe('approve', () => {
      beforeEach(() => {
        payload = { ...payload, callback_id: 'operations_route_approve' };
        jest.spyOn(DialogPrompts, 'sendOperationsNewRouteApprovalDialog').mockImplementation(fn);
      });
      it('should launch approve dialog prompt', async (done) => {
        await OperationsController.handleOperationsActions(payload, respond);
        expect(DialogPrompts.sendOperationsNewRouteApprovalDialog).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('operations approve request', () => {
      beforeEach(() => {
        const state = JSON.stringify({
          approve: {
            timeStamp, channelId, routeRequestId
          }
        });
        payload = {
          ...payload,
          submission: {
            routeName: 'QQQQQQ', routeCapacity: 12, takeOffTime: '12:30', regNumber: 'JDD3883'
          },
          callback_id: 'operations_route_approvedRequest'
        };
        jest.spyOn(OperationsNotifications, 'completeOperationsApprovedAction')
          .mockImplementation();
        payload = { ...payload, state };
      });

      it('should complete approve action', async (done) => {
        jest.spyOn(ManagerFormValidator, 'approveRequestFormValidation')
          .mockResolvedValue([]);
        getRouteRequestAndToken.mockResolvedValue(
          { routeRequest: { ...mockRouteRequestData }, slackBotOauthToken: 'dfdf' }
        );
        updateRouteRequest.mockResolvedValue(
          { ...mockRouteRequestData, status: 'Approved' }
        );
        completeOperationsApprovedAction.mockReturnValue('Token');
        await OperationsController.handleOperationsActions(payload, respond);
        expect(RouteRequestService.getRouteRequestAndToken).toHaveBeenCalled();
        expect(RouteRequestService.updateRouteRequest).toHaveBeenCalled();
        expect(OperationsNotifications.completeOperationsApprovedAction).toHaveBeenCalled();
        done();
      });

      it('should not submit invalid user input', async (done) => {
        payload = {
          ...payload,
          submission: {
            routeName: 'cele', routeCapacity: 'NJJDDJ', takeOffTime: '12:30', regNumber: '@@@$%%%'
          },
          callback_id: 'operations_route_approvedRequest'
        };
        getRouteRequestAndToken.mockResolvedValue(
          { routeRequest: { ...mockRouteRequestData }, slackBotOauthToken: 'dfdf' }
        );
        updateRouteRequest.mockResolvedValue(
          { ...mockRouteRequestData, status: 'Approved' }
        );
        completeOperationsApprovedAction.mockReturnValue('Token');
        const result = await OperationsController.handleOperationsActions(payload, respond);
        expect(result.errors[0]).toBeInstanceOf(SlackDialogError);
        expect(RouteRequestService.getRouteRequestAndToken).not.toHaveBeenCalled();
        expect(RouteRequestService.updateRouteRequest).not.toHaveBeenCalled();
        expect(OperationsNotifications.completeOperationsApprovedAction).not.toHaveBeenCalled();
        done();
      });

      it('should handle errors', async (done) => {
        getRouteRequestAndToken.mockResolvedValue();
        updateRouteRequest.mockResolvedValue();
        jest.spyOn(bugsnagHelper, 'log');
        await OperationsController.handleOperationsActions(payload, respond);
        expect(bugsnagHelper.log).toHaveBeenCalled();
        expect(respond.mock.calls[0][0].text).toEqual('Unsuccessful request. Kindly Try again');
        done();
      });
    });

    describe('operations route controller', () => {
      it('should return a function if action exist', () => {
        const result = OperationsController.operationsRouteController('approve');
        expect(result).toBeInstanceOf(Function);
      });
      it('should throw an error if action does exist', () => {
        try {
          OperationsController.operationsRouteController('doesNotExist')();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('Unknown action: operations_route_doesNotExist');
        }
      });
    });

    describe('handle manager actions', () => {
      let mockHandler;
      let payload2;
      beforeEach(() => {
        payload2 = { actions: [{ name: 'action' }], callback_id: 'dummy_callback_actions' };
        mockHandler = jest.fn().mockReturnValue({ test: 'dummy test' });
        jest.spyOn(OperationsController, 'operationsRouteController')
          .mockImplementation(() => mockHandler);
      });
      it('should properly handle route actions', async () => {
        payload2 = { ...payload2, callback_id: 'dummy_callback_id' };
        const result = await OperationsController.handleOperationsActions(payload2, respond);
        expect(OperationsController.operationsRouteController).toHaveBeenCalledWith('id');
        expect(mockHandler).toHaveBeenCalledWith(payload2, respond);
        expect(result).toEqual({ test: 'dummy test' });
      });
      it('should properly handle slack button actions', async () => {
        const result = await OperationsController.handleOperationsActions(payload2, respond);
        expect(OperationsController.operationsRouteController).toHaveBeenCalledWith('action');
        expect(mockHandler).toHaveBeenCalledWith(payload2, respond);
        expect(result).toEqual({ test: 'dummy test' });
      });
      it('should properly handle errors', async () => {
        payload2 = { ...payload2, callback_id: null };
        jest.spyOn(bugsnagHelper, 'log');
        await OperationsController.handleOperationsActions(payload2, respond);
        expect(bugsnagHelper.log).toHaveBeenCalledTimes(1);
      });
    });
  });
});

describe('Operations Route Controller', () => {
  let respond;
  const fn = () => ({});
  beforeEach(() => {
    respond = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('operations actions', () => {
    let payload;
    let getRouteRequestAndToken;
    let completeOperationsDeclineAction;
    let updateRouteRequest;
    let routeRequestId;
    let timeStamp;
    let channelId;
    beforeEach(() => {
      getRouteRequestAndToken = jest.spyOn(RouteRequestService, 'getRouteRequestAndToken');
      updateRouteRequest = jest.spyOn(RouteRequestService, 'updateRouteRequest');
      completeOperationsDeclineAction = jest.spyOn(
        OperationsNotifications, 'completeOperationsDeclineAction'
      );
      payload = {
        submission: {
          declineReason: 'QQQQQQ', startDate: '31/01/2019', endDate: '20/02/2019'
        },
        actions: [{ name: 'action', value: 'routeRequestId' }],
        channel: { id: 1 },
        team: { id: 1 },
        original_message: { ts: 'timestamp' }
      };
      ({ channel: { id: channelId }, original_message: { ts: timeStamp } } = payload);
      ({ id: routeRequestId } = mockRouteRequestData);
    });

    describe('decline', () => {
      beforeEach(() => {
        payload = { ...payload, callback_id: 'operations_route_decline' };
        jest.spyOn(DialogPrompts, 'sendReasonDialog').mockImplementation(fn);
      });
      it('should launch decline dialog prompt', async (done) => {
        getRouteRequestAndToken.mockResolvedValue(mockRouteRequestData);
        await OperationsController.handleOperationsActions(payload, respond);
        expect(DialogPrompts.sendReasonDialog).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('operations declined request', () => {
      beforeEach(() => {
        const state = JSON.stringify({
          decline: {
            timeStamp, channelId, routeRequestId
          }
        });
        payload = { ...payload, callback_id: 'operations_route_declinedRequest' };
        jest.spyOn(OperationsNotifications, 'completeOperationsDeclineAction')
          .mockImplementation();
        payload = { ...payload, state };
      });


      it('should complete decline action', async (done) => {
        getRouteRequestAndToken.mockResolvedValue({
          routeRequest: { ...mockRouteRequestData },
          slackBotOauthToken: 'dfdf'
        });
        updateRouteRequest.mockResolvedValue({
          ...mockRouteRequestData,
          status: 'Declined',
          opsComment: 'declinind'
        });
        completeOperationsDeclineAction.mockReturnValue('Token');
        await OperationsController.handleOperationsActions(payload, respond);
        expect(RouteRequestService.getRouteRequestAndToken).toHaveBeenCalled();
        expect(RouteRequestService.updateRouteRequest).toHaveBeenCalled();
        expect(OperationsNotifications.completeOperationsDeclineAction).toHaveBeenCalled();
        done();
      });

      it('should handle errors', async (done) => {
        getRouteRequestAndToken.mockResolvedValue();
        updateRouteRequest.mockResolvedValue();
        jest.spyOn(bugsnagHelper, 'log');
        await OperationsController.handleOperationsActions(payload, respond);
        expect(bugsnagHelper.log).toHaveBeenCalled();
        expect(respond.mock.calls[0][0].text).toEqual('Unsuccessful request. Kindly Try again');
        done();
      });
    });

    describe('operations route controller', () => {
      it('should return a function if action exist', () => {
        const result = OperationsController.operationsRouteController('decline');
        expect(result).toBeInstanceOf(Function);
      });
      it('should throw an error if action does exist', () => {
        try {
          OperationsController.operationsRouteController('doesNotExist')();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe('Unknown action: operations_route_doesNotExist');
        }
      });
    });
    describe('handle operations actions', () => {
      let mockHandler;
      let payload2;
      beforeEach(() => {
        payload2 = { actions: [{ name: 'action' }], callback_id: 'dummy_callback_actions' };
        mockHandler = jest.fn().mockReturnValue({ test: 'dummy test' });
        jest.spyOn(OperationsController, 'operationsRouteController')
          .mockImplementation(() => mockHandler);
      });
      it('should properly handle route actions', async () => {
        payload2 = { ...payload2, callback_id: 'dummy_callback_id' };
        const result = await OperationsController.handleOperationsActions(payload2, respond);
        expect(OperationsController.operationsRouteController).toHaveBeenCalledWith('id');
        expect(mockHandler).toHaveBeenCalledWith(payload2, respond);
        expect(result).toEqual({ test: 'dummy test' });
      });
      it('should properly handle slack button actions', async () => {
        const result = await OperationsController.handleOperationsActions(payload2, respond);
        expect(OperationsController.operationsRouteController).toHaveBeenCalledWith('action');
        expect(mockHandler).toHaveBeenCalledWith(payload2, respond);
        expect(result).toEqual({ test: 'dummy test' });
      });
      it('should properly handle errors', async () => {
        payload2 = { ...payload2, callback_id: null };
        jest.spyOn(bugsnagHelper, 'log');
        await OperationsController.handleOperationsActions(payload2, respond);
        expect(bugsnagHelper.log).toHaveBeenCalledTimes(1);
        expect(respond).toHaveBeenCalledTimes(1);
      });
    });
  });
});
