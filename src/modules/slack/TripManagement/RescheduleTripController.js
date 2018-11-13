import models from '../../../database/models';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';
import dateDialogHelper from '../../../helpers/dateHelper';
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
    const dateFormat = /^([1-9]|1[0-2])[/][0-3]?[0-9][/][2][0][0-9]{2}[ ][0-2]?[0-9][:][0-5][0-9]$/;

    if (!dateFormat.test(date)) {
      errors.push(
        new SlackDialogError('time', 'The time should be in the 24 hours format hh:mm')
      );
    }

    if (dateDialogHelper.dateChecker(date, userInfo.tz_offset) < 0) {
      errors.push(
        new SlackDialogError('new_month', 'This date seems to be in the past!'),
        new SlackDialogError('new_date', 'This date seems to be in the past!'),
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
        .then(() => InteractivePrompts.SendRescheduleCompletion(trip))
        .catch(() => InteractivePrompts.SendRescheduleError(trip));
    }).catch(() => InteractivePrompts.SendTripError());
  }
}

export default RescheduleTripController;
