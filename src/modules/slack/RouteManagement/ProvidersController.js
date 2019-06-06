import RouteRequestService from '../../../services/RouteRequestService';
import ProviderNotifications from '../SlackPrompts/notifications/ProviderNotifications/index';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import RouteService from '../../../services/RouteService';
import ConfirmRouteUseJob from '../../../services/jobScheduler/jobs/ConfirmRouteUseJob';

class ProvidersController {
  static async saveRoute(updatedRequest, submission, userId) {
    const { busStop, routeImageUrl } = updatedRequest;
    const {
      routeName, routeCapacity, takeOffTime, regNumber, driverId
    } = submission;
    const data = {
      destinationName: busStop.address,
      imageUrl: routeImageUrl,
      name: routeName,
      capacity: routeCapacity,
      takeOff: takeOffTime,
      vehicleRegNumber: regNumber,
      driverId,
      status: 'Active',
    };
    const batch = await RouteService.createRouteBatch(data);
    await Promise.all([
      ConfirmRouteUseJob.scheduleBatchStartJob(batch),
      RouteService.addUserToRoute(batch.id, userId),
    ]);
  }

  static async getFinalCabSubmissionDetails(submission) {
    const [capacity, , regNumber] = submission.cab.split(',');
    const [id, driverName, driverPhoneNo, driverNumber] = submission.driver.split(',');
    return {
      regNumber,
      routeCapacity: capacity,
      driverName,
      driverPhoneNumber: driverPhoneNo,
      driverId: id,
      driverNumber
    };
  }

  static async handleProvidersRouteApproval(data, respond) {
    try {
      const { team: { id: teamId } } = data;
      const { tripId, channel, timeStamp } = JSON.parse(data.state);
      const routeRequestId = tripId.split('_')[2];
      const routeInfo = JSON.parse(tripId.split('_')[3]);
      let { submission } = data;
      submission = { ...submission, ...routeInfo };
      const { slackBotOauthToken, routeRequest } = await RouteRequestService.getRouteRequestAndToken(routeRequestId, teamId);
      const updatedRequest = await RouteRequestService.updateRouteRequest(routeRequest.id, { status: 'Approved' });
      const cabDetails = await ProvidersController.getFinalCabSubmissionDetails(submission);
      submission = { ...submission, ...cabDetails };
      const { id } = updatedRequest.engagement.fellow;
      const save = ProvidersController.saveRoute(updatedRequest, submission, id);
      const complete = ProviderNotifications.completeProviderApprovedAction(
        updatedRequest, channel, teamId, timeStamp, slackBotOauthToken, submission, false
      );
      await Promise.all([complete, save]);
    } catch (error) {
      bugsnagHelper.log(error);
      respond(
        new SlackInteractiveMessage('Unsuccessful request. Kindly Try again')
      );
    }
  }
}

export default ProvidersController;
