/* eslint-disable no-unused-vars */
import RouteRequestService from '../../../../services/RouteRequestService';
import { cabService } from '../../../../services/CabService';
import OperationsNotifications from '../../SlackPrompts/notifications/OperationsRouteRequest/index';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import { providerService } from '../../../../services/ProviderService';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import UserService from '../../../../services/UserService';
import SlackNotifications from '../../SlackPrompts/Notifications';
import { SlackAttachment } from '../../SlackModels/SlackMessageModels';
import ProviderAttachmentHelper from '../../SlackPrompts/notifications/ProviderNotifications/helper';

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

  static async getBotToken(url) {
    const { botToken } = await TeamDetailsService.getTeamDetailsByTeamUrl(url);
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

  static async sendcompleteOpAssignCabMsg(teamId, ids, tripInformation) {
    const { requesterSlackId, riderSlackId } = ids;
    const { sendUserConfirmOrDeclineNotification } = SlackNotifications;
    SlackNotifications
      .sendManagerConfirmOrDeclineNotification(teamId, requesterSlackId, tripInformation, false);
    sendUserConfirmOrDeclineNotification(teamId, riderSlackId, tripInformation, false);
    if (riderSlackId !== requesterSlackId) {
      sendUserConfirmOrDeclineNotification(teamId, requesterSlackId, tripInformation, false);
    }
  }

  static getTripDetailsAttachment(tripInformation, driverDetails) {
    const tripDetailsAttachment = new SlackAttachment('Trip request complete');
    tripDetailsAttachment.addOptionalProps('', '', '#3c58d7');
    tripDetailsAttachment.addFieldsOrActions('fields',
      ProviderAttachmentHelper.providerFields(tripInformation, driverDetails));
    return tripDetailsAttachment;
  }

  static getUpdateTripStatusPayload(tripId, confirmationComment, opsUserId, timeStamp) {
    return {
      tripStatus: 'Confirmed',
      tripId,
      operationsComment: confirmationComment,
      confirmedById: opsUserId,
      approvalDate: timeStamp,
    };
  }
}

export default OperationsHelper;
