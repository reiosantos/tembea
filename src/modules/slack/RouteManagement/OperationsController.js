import bugsnagHelper from '../../../helpers/bugsnagHelper';
import RouteRequestService from '../../../services/RouteRequestService';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import ManagerFormValidator from '../../../helpers/slack/UserInputValidator/managerFormValidator';
import OperationsNotifications from '../SlackPrompts/notifications/OperationsRouteRequest/index';
import { getAction } from './rootFile';
import RouteService from '../../../services/RouteService';

const saveRoute = async (updatedRequest, submission) => {
  const { busStop, routeImageUrl } = updatedRequest;
  const {
    routeName, routeCapacity, takeOffTime, regNumber
  } = submission;
  const data = {
    destinationName: busStop.address,
    imageUrl: routeImageUrl,
    name: routeName,
    capacity: routeCapacity,
    takeOff: takeOffTime,
    vehicleRegNumber: regNumber
  };
  await RouteService.createRouteBatch(data);
};

const handlers = {
  decline: async (payload) => {
    const { actions, channel: { id: channelId }, original_message: { ts: timeStamp } } = payload;
    const [{ value: routeRequestId }] = actions;

    const state = {
      decline: {
        timeStamp,
        channelId,
        routeRequestId
      }
    };
    DialogPrompts.sendReasonDialog(payload,
      'operations_route_declinedRequest',
      JSON.stringify(state), 'Decline', 'Decline', 'declineReason', 'route');
  },
  declinedRequest: async (payload, respond) => {
    try {
      const { submission: { declineReason }, team: { id: teamId } } = payload;
      const { decline } = JSON.parse(payload.state);
      const { timeStamp, channelId, routeRequestId } = decline;
      const {
        slackBotOauthToken: oauthToken, routeRequest
      } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      // should change  to ops comment
      const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, {
        status: 'Declined',
        opsComment: declineReason
      });
      await OperationsNotifications.completeOperationsDeclineAction(
        updatedRequest, channelId, teamId, routeRequestId, timeStamp, oauthToken, payload, respond
      );
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  },
  approve: async (payload) => {
    const { actions, channel: { id: channelId }, original_message: { ts: timeStamp } } = payload;
    const [{ value: routeRequestId }] = actions;

    const state = {
      approve: {
        timeStamp,
        channelId,
        routeRequestId
      }
    };
    DialogPrompts.sendOperationsNewRouteApprovalDialog(payload, JSON.stringify(state));
  },
  approvedRequest: async (payload, respond) => {
    try {
      const { submission, team: { id: teamId }, user: { id: userId } } = payload;
      const errors = ManagerFormValidator.approveRequestFormValidation(payload);
      if (errors.length > 0) {
        return { errors };
      }
      const { approve } = JSON.parse(payload.state);
      const { channelId, timeStamp, routeRequestId } = approve;
      const {
        slackBotOauthToken, routeRequest
      } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, {
        status: 'Approved'
      });
      const save = saveRoute(updatedRequest, submission);
      const complete = OperationsNotifications
        .completeOperationsApprovedAction(
          updatedRequest, channelId, timeStamp, userId, slackBotOauthToken, submission
        );
      Promise.all([complete, save]);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Unsuccessful request. Kindly Try again'));
    }
  }
};
class OperationsController {
  static operationsRouteController(action) {
    const errorHandler = (() => {
      throw new Error(`Unknown action: operations_route_${action}`);
    });
    return handlers[action] || errorHandler;
  }

  static handleOperationsActions(payload, respond) {
    try {
      const action = getAction(payload, 'actions');
      const actionHandler = OperationsController.operationsRouteController(action);
      return actionHandler(payload, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang:: I was unable to do that.'));
    }
  }
}

export default OperationsController;
