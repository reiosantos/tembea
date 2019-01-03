import models from '../../../../database/models';
import { isTripRescheduleTimedOut, isTripRequestApproved } from './slackValidations';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';

const { TripRequest } = models;

export default class TripRescheduleHelper {
  static respondRescheduleError(timedOut, approved, respond) {
    if (timedOut) {
      return respond(InteractivePrompts.passedTimeOutLimit());
    }

    if (approved) {
      return respond(InteractivePrompts.rescheduleConfirmedApprovedError());
    }
  }

  static async sendTripRescheduleDialog(payload, respond, requestId) {
    try {
      const tripRequest = await TripRequest.findByPk(requestId);
      const approved = isTripRequestApproved(tripRequest);
      const timedOut = isTripRescheduleTimedOut(tripRequest);

      TripRescheduleHelper.respondRescheduleError(timedOut, approved, respond);

      if (!timedOut && !approved) {
        await DialogPrompts.sendRescheduleTripForm(
          payload,
          'reschedule_trip',
          `reschedule ${payload.response_url} ${requestId}`,
          'Reschedule Trip'
        );
      }
    } catch (error) {
      bugsnagHelper.log(error);
      respond(InteractivePrompts.sendTripError());
    }
  }
}
