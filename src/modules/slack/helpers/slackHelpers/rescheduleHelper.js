import models from '../../../../database/models';
import { IsTripRequestConfirmed, IsTripRescheduleTimedOut } from './slackValidations';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import InteractivePrompts from '../../SlackPrompts/InteractivePrompts';

const { TripRequest } = models;

export default class TripRescheduleHelper {
  static async sendTripRescheduleDialog(payload, respond, requestId) {
    try {
      const tripRequest = await TripRequest.findByPk(requestId);
      const confirmed = IsTripRequestConfirmed(tripRequest);
      const timedOut = IsTripRescheduleTimedOut(tripRequest);

      if (confirmed) {
        respond(InteractivePrompts.rescheduleConfirmedError());
      }
      if (!timedOut && !confirmed) {
        DialogPrompts.sendRescheduleTripForm(
          payload,
          'reschedule_trip',
          `reschedule ${payload.response_url} ${requestId}`,
          'Reschedule Trip'
        );
      } else {
        respond(InteractivePrompts.passedTimeOutLimit());
      }
    } catch (error) {
      respond(InteractivePrompts.sendTripError());
    }
  }
}
