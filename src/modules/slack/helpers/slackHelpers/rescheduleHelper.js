import tripService from '../../../../services/TripService';
import { isTripRescheduleTimedOut, isTripRequestApproved } from './slackValidations';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import InteractivePromptSlackHelper from './InteractivePromptSlackHelper';


export default class TripRescheduleHelper {
  static respondRescheduleError(timedOut, approved) {
    if (timedOut) {
      return InteractivePromptSlackHelper.passedTimeOutLimit();
    }

    if (approved) {
      return InteractivePromptSlackHelper.rescheduleConfirmedApprovedError();
    }
  }

  static async sendTripRescheduleDialog(payload, requestId) {
    try {
      const tripRequest = await tripService.getById(requestId);
      const approved = isTripRequestApproved(tripRequest);
      const timedOut = isTripRescheduleTimedOut(tripRequest);

      const rescheduleError = TripRescheduleHelper.respondRescheduleError(timedOut, approved);

      if (!timedOut && !approved) {
        await DialogPrompts.sendRescheduleTripForm(
          payload,
          'reschedule_trip',
          `reschedule ${payload.response_url} ${requestId}`,
          'Reschedule Trip'
        );
      }
      return rescheduleError;
    } catch (error) {
      bugsnagHelper.log(error);
      return InteractivePromptSlackHelper.sendTripError();
    }
  }
}
