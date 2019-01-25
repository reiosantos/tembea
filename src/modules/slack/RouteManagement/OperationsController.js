import bugsnagHelper from '../../../helpers/bugsnagHelper';
import RouteRequestService from '../../../services/RouteRequestService';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import ManagerFormValidator from '../../../helpers/slack/UserInputValidator/managerFormValidator';
import OperationsNotifications from '../SlackPrompts/notifications/OperationsRouteRequest/index';

const handlers = {
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

      await OperationsNotifications
        .completeOperationsApprovedAction(
          updatedRequest, channelId, timeStamp, userId, slackBotOauthToken, submission
        );
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
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
      const { actions, callback_id: callBackId } = payload;
      let action = callBackId.split('_')[2];
      if (action === 'actions') {
        ([{ name: action }] = actions);
      }
      const actionHandler = OperationsController.operationsRouteController(action);
      return actionHandler(payload, respond);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(new SlackInteractiveMessage('Error:bangbang:: I was unable to do that.'));
    }
  }
}

export default OperationsController;
