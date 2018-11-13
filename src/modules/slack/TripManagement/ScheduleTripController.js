import { WebClient } from '@slack/client';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';

const web = new WebClient(process.env.BOT_TOKEN);

class ScheduleTripController {
  static async runValidations(payload) {
    const { pickup, destination, date_time } = payload.submission;
    const errors = [];
    const wordsOnly = /^[A-Za-z- ]+$/;
    const dateFormat = /^([1-9]|1[0-2])[/][0-3]?[0-9][/][2][0][0-9]{2}[ ][0-2]?[0-9][:][0-5][0-9]$/;

    // check that locations contain only alphabets
    if (!wordsOnly.test(pickup)) {
      errors.push(new SlackDialogError('pickup', 'Only alphabets, dashes and spaces are allowed.'));
    }
    if (!wordsOnly.test(destination)) {
      errors.push(new SlackDialogError('destination', 'Only alphabets, dashes and spaces are allowed.'));
    }
    if (pickup.toLowerCase() === destination.toLowerCase()) {
      errors.push(
        new SlackDialogError('pickup', 'Pickup location and Destination cannot be the same.'),
        new SlackDialogError('destination', 'Pickup location and Destination cannot be the same.')
      );
    }
    // Check that date is not in the past
    const user = await this.fetchUserInformationFromSlack(payload.user.id);
    const diff = this.dateChecker(date_time, user.tz_offset);

    if (diff < 0) {
      errors.push(
        new SlackDialogError('date_time', 'Date cannot be in the past.')
      );
    }
    if (!dateFormat.test(date_time)) {
      errors.push(
        new SlackDialogError('date_time', 'Time format must be in Month/Day/Year format. See hint.')
      );
    }
    return errors;
  }

  static dateChecker(userDateInput, timezoneOffset) {
    const dateInputTime = new Date(userDateInput).getTime();
    const now = new Date().getTime();
    const contextTimezoneOffset = new Date().getTimezoneOffset() * 60000;

    return dateInputTime - (now + contextTimezoneOffset + (timezoneOffset * 1000));
  }

  static async fetchUserInformationFromSlack(userId) {
    const { user } = await web.users.info({ //eslint-disable-line
      token: process.env.BOT_TOKEN,
      user: userId
    });
    return user;
  }
}

export default ScheduleTripController;
