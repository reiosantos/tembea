import tripService from '../../../services/TripService';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';
import DateDialogHelper from '../../../helpers/dateHelper';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import Utils from '../../../utils';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import SlackEvents from '../events';
import { slackEventNames } from '../events/slackEvents';
import SlackHelpers from '../../../helpers/slack/slackHelpers';


const web = new WebClientSingleton();

class RescheduleTripController {
  static async getUserInfo(slackId, slackBotOauthToken) {
    const { user } = await web.getWebClient(slackBotOauthToken).users.info({
      user: slackId
    });
    return user;
  }

  static async runValidations(date, user, slackBotOauthToken) {
    const userInfo = await this.getUserInfo(user.id, slackBotOauthToken);
    const errors = [];

    if (!DateDialogHelper.validateDateTime(date)) {
      errors.push(
        new SlackDialogError('time', 'The time should be in the 24 hours format hh:mm')
      );
    }

    if (DateDialogHelper.dateChecker(date, userInfo.tz_offset) < 0) {
      errors.push(
        new SlackDialogError('newMonth', 'This date seems to be in the past!'),
        new SlackDialogError('newDate', 'This date seems to be in the past!'),
        new SlackDialogError('time', 'This date seems to be in the past!')
      );
    }

    return errors;
  }

  static async rescheduleTrip(tripId, newDate, payload, respond) {
    try {
      const trip = await tripService.getById(tripId);
      if (trip) {
        const { user: { id: slackUserId }, team: { id: teamId } } = payload;
        const slackInfo = await SlackHelpers.getUserInfoFromSlack(slackUserId, teamId);
        trip.departureTime = Utils.formatDateForDatabase(newDate, slackInfo.tz);
        const newTrip = await trip.save();
        const requestType = 'reschedule';
        SlackEvents.raise(slackEventNames.NEW_TRIP_REQUEST, payload, newTrip, respond, requestType);
        return InteractivePrompts.sendRescheduleCompletion(newTrip);
      }

      return InteractivePrompts.sendTripError();
    } catch (error) {
      bugsnagHelper.log(error);
      return InteractivePrompts.sendRescheduleError(tripId);
    }
  }
}

export default RescheduleTripController;
