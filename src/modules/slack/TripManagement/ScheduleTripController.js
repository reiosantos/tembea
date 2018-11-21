import { WebClient } from '@slack/client';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';
import models from '../../../database/models';

const web = new WebClient(process.env.BOT_TOKEN);
const {
  TripRequest, User, Location, Address
} = models;

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
      errors.push(
        new SlackDialogError('destination', 'Only alphabets, dashes and spaces are allowed.')
      );
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

  static async createRequest(payload) {
    let requestId;
    try {
      const { pickup, date_time, destination } = payload.submission;
      const { id, name } = payload.user;
      const username = name.replace(/\./g, ' ');

      await Location.findOrCreate({
        where: { id: 1 },
        defaults: { longitude: 34, latitude: 23 }
      }).spread((location) => {
        Address.create({
          locationId: location.dataValues.id,
          address: destination
        });
      });

      let passenger;
      if (payload.submission.rider) {
        const rider = await ScheduleTripController.fetchUserInformationFromSlack(
          payload.submission.rider
        );
        const { real_name, profile } = rider;
        await User.findOrCreate({
          where: { slackId: rider.id },
          defaults: { name: real_name, email: profile.email }
        }).spread((user) => {
          passenger = user.dataValues.id;
        });
      }

      const requester = await ScheduleTripController.fetchUserInformationFromSlack(id);
      const { real_name, profile } = requester;
      User.findOrCreate({
        where: { slackId: id },
        defaults: { name: real_name, email: profile.email }
      }).spread((user) => {
        TripRequest.create({
          riderId: payload.submission.rider ? passenger : user.dataValues.id,
          name: username,
          departureTime: date_time,
          requestedById: user.dataValues.id,
          originId: 1,
          destinationId: 1
        }).then((newRequest) => {
          requestId = newRequest.id;
        });
      });
    } catch (error) {
      throw error;
    }
    return requestId;
  }
}

export default ScheduleTripController;
