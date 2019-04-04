import bugsnagHelper from '../../../helpers/bugsnagHelper';
import RouteRequestService from '../../../services/RouteRequestService';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import ManagerFormValidator from '../../../helpers/slack/UserInputValidator/managerFormValidator';
import OperationsNotifications from '../SlackPrompts/notifications/OperationsRouteRequest/index';
import RouteService from '../../../services/RouteService';
import { getAction } from './rootFile';
import ConfirmRouteUseJob from '../../../services/jobScheduler/jobs/ConfirmRouteUseJob';
import CleanData from '../../../helpers/cleanData';

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
    vehicleRegNumber: regNumber,
    status: 'Active',
  };
  const batch = await RouteService.createRouteBatch(data);
  ConfirmRouteUseJob.scheduleBatchStartJob(batch);
};

const handlers = {
  decline: async (payload) => {
    const { actions, channel: { id: channelId }, original_message: { ts: timeStamp } } = payload;
    const [{ value: routeRequestId }] = actions;

    const { botToken, routeRequest } = await RouteRequestService
      .getRouteRequestAndToken(routeRequestId, payload.team.id);

    const declined = routeRequest.status === 'Declined';
    const approved = routeRequest.status === 'Approved';

    if (approved || declined) {
      OperationsNotifications.updateOpsStatusNotificationMessage(payload, routeRequest, botToken);
      return;
    }

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
  declinedRequest: async (data, respond) => {
    try {
      const payload = CleanData.trim(data);
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
        updatedRequest, channelId, teamId, routeRequestId,
        timeStamp, oauthToken, payload, respond, false
      );
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  },
  approve: async (data) => {
    const payload = CleanData.trim(data);
    const { actions, channel: { id: channelId }, original_message: { ts: timeStamp } } = payload;
    const [{ value: routeRequestId }] = actions;

    const { botToken, routeRequest, routeRequest: { status } } = await RouteRequestService
      .getRouteRequestAndToken(routeRequestId, payload.team.id);

    const declined = status === 'Declined';
    const approved = status === 'Approved';

    if (approved || declined) {
      OperationsNotifications.updateOpsStatusNotificationMessage(payload, routeRequest, botToken);
      return;
    }
    const state = {
      approve: {
        timeStamp,
        channelId,
        routeRequestId
      }
    };
    DialogPrompts.sendOperationsNewRouteApprovalDialog(payload, JSON.stringify(state));
  },
  approvedRequest: async (data, respond) => {
    const payload = CleanData.trim(data);
    try {
      const { submission, team: { id: teamId }, user: { id: userId } } = payload;
      const errors = ManagerFormValidator.approveRequestFormValidation(payload);
      if (errors.length > 0) { return { errors }; }
      const { approve } = JSON.parse(payload.state);
      const { channelId, timeStamp, routeRequestId } = approve;
      const {
        slackBotOauthToken, routeRequest
      } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, {
        status: 'Approved'
      });
      if (updatedRequest) {
        const save = saveRoute(updatedRequest, submission);
        const complete = OperationsNotifications
          .completeOperationsApprovedAction(
            updatedRequest, channelId, timeStamp, userId, slackBotOauthToken, submission, false
          );
        Promise.all([complete, save]);
      } else { throw new Error(); }
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

  static async handleOperationsActions(data, respond) {
    try {
      const payload = CleanData.trim(data);
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
