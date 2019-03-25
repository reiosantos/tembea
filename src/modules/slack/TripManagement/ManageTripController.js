import validator from 'validator';
import tripService from '../../../services/TripService';
import DepartmentService from '../../../services/DepartmentService';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import slackEvents from '../events';
import { slackEventNames } from '../events/slackEvents';
import TeamDetailsService from '../../../services/TeamDetailsService';
import bugsnagHelper from '../../../helpers/bugsnagHelper';


class ManageTripController {
  static runValidation(reasonObject) {
    const [field, reason] = Object.entries(reasonObject)[0];
    const errors = [];
    if (reason.trim() === '') {
      errors.push(new SlackDialogError(field,
        'This field cannot be empty'));
    }
    if (reason.trim().length > 100) {
      errors.push(new SlackDialogError(field,
        'Character length must be less than or equal to 100'));
    }
    return errors;
  }

  static async declineTrip(state, declineReason, respond, teamId) {
    const reason = validator.blacklist(declineReason.trim(), '=\'"\t\b(0)Z').trim();

    try {
      const trip = await tripService.getById(state[2]);
      const head = await DepartmentService.getHeadByDeptId(trip.departmentId);

      const ride = trip;
      ride.tripStatus = 'DeclinedByManager';
      ride.managerComment = reason;
      ride.declinedById = head.id;

      await tripService.updateRequest(trip.id, ride);

      const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
      InteractivePrompts.sendManagerDeclineOrApprovalCompletion(true,
        ride, state[0], state[1], slackBotOauthToken);
      slackEvents.raise(slackEventNames.DECLINED_TRIP_REQUEST,
        ride, respond, slackBotOauthToken);
    } catch (error) {
      bugsnagHelper.log(error);
      respond({ text: 'Dang, something went wrong there.' });
    }
  }
}

export default ManageTripController;
