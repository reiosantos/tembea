import { WebClient } from '@slack/client';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';
import models from '../../../database/models';
import DateDialogHelper from '../../../helpers/dateHelper';

const web = new WebClient(process.env.SLACK_BOT_OAUTH_TOKEN);
const {
  TripRequest, User, Location, Address
} = models;

class ScheduleTripValidator {
  static checkWord(word, name) {
    const wordsOnly = /^[A-Za-z- ]+$/;
    if (!wordsOnly.test(word)) {
      return [new SlackDialogError(name, 'Only alphabets, dashes and spaces are allowed.')];
    }
    return [];
  }

  static checkOriginAnDestination(pickup, destination, pickupName, destinationName) {
    if (pickup.toLowerCase() === destination.toLowerCase()) {
      return [
        new SlackDialogError(pickupName, 'Pickup location and Destination cannot be the same.'),
        new SlackDialogError(destinationName, 'Pickup location and Destination cannot be the same.')
      ];
    }
    return [];
  }

  static checkDate(date, tzOffset) {
    const diff = DateDialogHelper.dateChecker(date, tzOffset);
    if (diff < 0) {
      return [new SlackDialogError('date_time', 'Date cannot be in the past.')];
    }
    return [];
  }

  static checkDateFormat(date) {
    if (!DateDialogHelper.dateFormat(date)) {
      return [new SlackDialogError('date_time',
        'Time format must be in Month/Day/Year format. See hint.')];
    }
    return [];
  }
}

class ScheduleTripController {
  static async runValidations(payload) {
    const { pickup, destination, date_time } = payload.submission;
    const errors = [];

    errors.push(...ScheduleTripValidator.checkWord(pickup, 'pickup'));
    errors.push(...ScheduleTripValidator.checkWord(destination, 'destination'));
    errors.push(...ScheduleTripValidator.checkOriginAnDestination(
      pickup,
      destination,
      'pickup',
      'destination'
    ));

    let user = {};
    try {
      user = await this.fetchUserInformationFromSlack(payload.user.id);
    } catch (error) {
      throw new Error('There was a problem processing your request');
    }
    
    errors.push(...ScheduleTripValidator.checkDate(date_time, user.tz_offset));
    errors.push(...ScheduleTripValidator.checkDateFormat(date_time));

    return errors;
  }

  static async fetchUserInformationFromSlack(userId) {
    const { user } = await web.users.info({ //eslint-disable-line
      token: process.env.SLACK_BOT_OAUTH_TOKEN,
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

      await ScheduleTripController.createLocation(destination);

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
      await User.findOrCreate({
        where: { slackId: id },
        defaults: { name: real_name, email: profile.email }
      }).spread(async (user) => {
        requestId = await ScheduleTripController.createTripRequest(payload,
          passenger,
          user,
          username,
          date_time,
          requestId);
      });
    } catch (error) {
      throw error;
    }
    return requestId;
  }

  static async createTripRequest(payload, passenger, user, username, date_time, requestId) {
    let reqId = requestId;
    await TripRequest.create({
      riderId: payload.submission.rider ? passenger : user.dataValues.id,
      name: username,
      tripStatus: 'Pending',
      departureTime: date_time,
      requestedById: user.dataValues.id,
      originId: 1,
      destinationId: 1
    }).then((newRequest) => {
      reqId = newRequest.dataValues.id;
    });
    return reqId;
  }

  static async createLocation(destination) {
    await Location.findOrCreate({
      where: { id: 1 },
      defaults: { longitude: 34, latitude: 23 }
    }).spread((location) => {
      Address.create({
        locationId: location.dataValues.id,
        address: destination
      });
    });
  }
}

export default ScheduleTripController;
