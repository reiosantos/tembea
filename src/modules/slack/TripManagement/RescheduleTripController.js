import models from '../../../database/models';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';
import DateDialogHelper from '../../../helpers/dateHelper';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';

const { TripRequest } = models;
const web = new WebClientSingleton();

class RescheduleTripController {
  static async getUserInfo(slackId) {
    const { user } = await web.getWebClient().users.info({
      user: slackId
    });
    return user;
  }

  static async runValidations(date, user) {
    const userInfo = await this.getUserInfo(user.id);
    const errors = [];

    if (!DateDialogHelper.dateFormat(date)) {
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

  static async rescheduleTrip(tripId, newDate) {
    return TripRequest.findByPk(tripId).then((ride) => {
      const trip = ride;
      trip.departureTime = newDate;
      return ride
        .save()
        .then(() => InteractivePrompts.sendRescheduleCompletion(trip))
        .catch(() => InteractivePrompts.sendRescheduleError(trip));
    }).catch(() => InteractivePrompts.sendTripError());
  }
}

export default RescheduleTripController;