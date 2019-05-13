
import RouteRequestService from '../../../../services/RouteRequestService';
import CabService from '../../../../services/CabService';
import TripActionsController from '../../TripManagement/TripActionsController';
import OperationsNotifications from '../../SlackPrompts/notifications/OperationsRouteRequest/index';
import { saveRoute } from '../../RouteManagement/OperationsController';
import CleanData from '../../../../helpers/cleanData';

class OperationsHelper {
  static async sendOpsData(data) {
    const { team: { id: teamId }, user: { id: userId } } = data;
    let { submission } = data;
    const { approve, routeRequestData } = JSON.parse(data.state);
    const { channelId, timeStamp, routeRequestId } = approve;
    const { callback_id: callbackId } = data;
    const payload = CleanData.trim(data);
    const errors = (callbackId === 'operations_reason_dialog_route')
      ? TripActionsController.runCabValidation(payload) : [];
    if (errors && errors.length > 0) return { errors };
    const { slackBotOauthToken, routeRequest } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
    const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, {
      status: 'Approved'
    });
    const cabDetails = await OperationsHelper.getCabSubmissionDetails(data, submission);
    if (updatedRequest) {
      submission = {
        ...submission, ...cabDetails, ...routeRequestData
      };
      const save = saveRoute(updatedRequest, submission);
      const complete = OperationsNotifications.completeOperationsApprovedAction(
        updatedRequest, channelId, timeStamp, userId, slackBotOauthToken, submission, false
      );
      Promise.all([complete, save]);
    } else { throw new Error(); }
  }

  static async getCabSubmissionDetails(data, submission) {
    let regNumber;
    let routeCapacity;
    if (data.callback_id === 'operations_reason_dialog_route') {
      const {
        driverName, driverPhoneNo, regNumber: rgNum, capacity, model
      } = submission;
      await CabService.findOrCreateCab(driverName, driverPhoneNo, rgNum, capacity, model);
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
