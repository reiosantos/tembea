import RouteRequestService from '../../../../services/RouteRequestService';
import { cabService } from '../../../../services/CabService';
import OperationsNotifications from '../../SlackPrompts/notifications/OperationsRouteRequest/index';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';

class OperationsHelper {
  static async sendOpsData(data) {
    try {
      const { team: { id: teamId }, user: { id: userId } } = data;
      let { submission } = data;
      const { approve } = JSON.parse(data.state);
      const { channelId, timeStamp, routeRequestId } = approve;
      const {
        slackBotOauthToken, routeRequest
      } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, {
        status: 'Approved'
      });
      const { routeName, takeOffTime } = submission;
      const routeRequestData = { routeName, takeOffTime };
      if (updatedRequest) {
        submission = {
          ...submission, ...routeRequestData
        };

        const complete = OperationsNotifications.completeOperationsApprovedAction(
          updatedRequest, channelId, timeStamp, userId, slackBotOauthToken, submission, false
        );
        await complete;
      }
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async getCabSubmissionDetails(data, submission) {
    let regNumber;
    let routeCapacity;
    if (data.callback_id === 'operations_reason_dialog_route') {
      const {
        driverName, driverPhoneNo, regNumber: rgNum, capacity, model
      } = submission;
      await cabService.findOrCreateCab(driverName, driverPhoneNo, rgNum, capacity, model);
      regNumber = rgNum;
      routeCapacity = capacity;
    } else {
      const [, , regNo] = submission.cab.split(',');
      regNumber = regNo;
      routeCapacity = await RouteRequestService.getCabCapacity(regNumber);
    }
    return {
      regNumber,
      routeCapacity
    };
  }
}

export default OperationsHelper;
