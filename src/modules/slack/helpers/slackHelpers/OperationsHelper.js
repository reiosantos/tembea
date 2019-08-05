/* eslint-disable no-unused-vars */
import RouteRequestService from '../../../../services/RouteRequestService';
import { cabService } from '../../../../services/CabService';
import OperationsNotifications from '../../SlackPrompts/notifications/OperationsRouteRequest/index';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import SlackNotifications from '../../SlackPrompts/Notifications';
import { SlackAttachment } from '../../SlackModels/SlackMessageModels';
import ProviderAttachmentHelper from '../../SlackPrompts/notifications/ProviderNotifications/helper';
import ProviderNotifications from '../../SlackPrompts/notifications/ProviderNotifications';
import RouteNotifications from '../../SlackPrompts/notifications/RouteNotifications';

class OperationsHelper {
  static async completeRouteApproval(updatedRequest, result, {
    channelId,
    opsSlackId,
    timeStamp,
    submission,
    botToken
  }) {
    // send cab and driver request to provider
    const providerNotification = ProviderNotifications.sendRouteApprovalNotification(
      result.batch, submission.providerId, botToken
    );

    // send completion message to ops
    const opsNotification = OperationsNotifications.completeOperationsApprovedAction(
      updatedRequest, channelId, timeStamp, opsSlackId, botToken, submission
    );

    // send completion message to manager
    const managerNotification = RouteNotifications.sendRouteApproveMessageToManager(
      updatedRequest, botToken, submission
    );

    // send completion message to user
    const userNotification = RouteNotifications.sendRouteApproveMessageToFellow(
      updatedRequest, botToken, submission
    );
    return Promise.all(
      [providerNotification, opsNotification, managerNotification, userNotification]
    );
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
