/* eslint-disable no-unused-vars */
import RouteRequestService from '../../../../services/RouteRequestService';
import { cabService } from '../../../../services/CabService';
import OperationsNotifications from '../../SlackPrompts/notifications/OperationsRouteRequest/index';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import { providerService } from '../../../../services/ProviderService';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import UserService from '../../../../services/UserService';

class OperationsHelper {
  static async sendOpsData(data) {
    try {
      const { team: { id: teamId }, user: { id: userId } } = data;
      const { submission } = data;
      const { Provider } = submission;
      const providerId = Provider.split(',')[0];
      const provider = await providerService.getProviderById(providerId);
      const { id } = await UserService.getUserBySlackId(userId);
      const { approve } = JSON.parse(data.state);
      const {
        channelId, timeStamp, routeRequestId, confirmationComment
      } = approve;
      const {
        slackBotOauthToken, routeRequest
      } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const [updatedRequest, requestData, opsData] = await OperationsHelper.getCompleteOperationsRouteApprovalData(
        routeRequest, id, confirmationComment, submission,
        provider, userId, slackBotOauthToken, timeStamp, channelId
      );
      return OperationsNotifications.completeOperationsRouteApproval(
        updatedRequest, requestData, opsData
      );
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async getCompleteOperationsRouteApprovalData(
    routeRequest, opsUserId, comment, submission, provider, opsId, botToken, timeStamp, channelId
  ) {
    const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, {
      status: 'Approved',
      opsReviewerId: opsUserId,
      opsComment: comment
    });
    const requestData = { ...submission, provider };
    const opsData = {
      opsId, botToken, timeStamp, channelId
    };

    return [updatedRequest, requestData, opsData];
  }

  static async getBotToken(requestData) {
    const { teamUrl } = requestData;
    const { botToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    return botToken;
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
