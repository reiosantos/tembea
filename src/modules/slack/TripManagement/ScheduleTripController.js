import { WebClient } from '@slack/client';
import { SlackEvents, slackEventsNames } from '../events/slackEvents';
import { SlackDialogError } from '../SlackModels/SlackDialogModels';
import models from '../../../database/models';
import DateDialogHelper from '../../../helpers/dateHelper';

const web = new WebClient(process.env.SLACK_BOT_OAUTH_TOKEN);
const { TripRequest, User, Address } = models;

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
      return [new SlackDialogError('dateTime', 'Date cannot be in the past.')];
    }
    return [];
  }

  static checkDateFormat(date) {
    if (!DateDialogHelper.dateFormat(date)) {
      return [
        new SlackDialogError(
          'dateTime',
          'Time format must be in Day/Month/Year HH:MM format. See hint.'
        )
      ];
    }
    return [];
  }
}

class ScheduleTripController {
  static async runValidations(payload) {
    const { pickup, destination, dateTime } = payload.submission;
    const errors = [];

    errors.push(...ScheduleTripValidator.checkWord(pickup, 'pickup'));
    errors.push(...ScheduleTripValidator.checkWord(destination, 'destination'));
    errors.push(
      ...ScheduleTripValidator.checkOriginAnDestination(
        pickup,
        destination,
        'pickup',
        'destination'
      )
    );

    let user = {};
    try {
      user = await this.fetchUserInformationFromSlack(payload.user.id);
    } catch (error) {
      throw new Error('There was a problem processing your request');
    }

    errors.push(...ScheduleTripValidator.checkDate(dateTime, user.tz_offset));
    errors.push(...ScheduleTripValidator.checkDateFormat(dateTime));

    return errors;
  }

  static async fetchUserInformationFromSlack(userId) {
    const { user } = await web.users.info({
      //eslint-disable-line
      token: process.env.SLACK_BOT_OAUTH_TOKEN,
      user: userId
    });
    return user;
  }

  static async originAndDestination(pickup, destination) {
    const originAddress = await Address.findOrCreate({
      where: { address: pickup },
      defaults: { address: pickup },
      raw: true
    });

    const destinationAddress = await Address.findOrCreate({
      where: { address: destination },
      defaults: { address: destination },
      raw: true
    });

    return {
      originId: originAddress[0].id,
      destinationId: destinationAddress[0].id
    };
  }

  static async getPassengerId(payload) {
    if (payload.submission.rider) {
      const rider = await ScheduleTripController.fetchUserInformationFromSlack(
        payload.submission.rider
      );
      // eslint-disable-next-line camelcase
      const { real_name, profile } = rider;
      const passenger = await User.findOrCreate({
        where: { slackId: rider.id },
        defaults: { name: real_name, email: profile.email },
        raw: true
      });
      return {
        passengerId: passenger[0].id
      };
    }
  }

  static async getRequesterId(id) {
    const requesterInfo = await ScheduleTripController.fetchUserInformationFromSlack(id);
    // eslint-disable-next-line camelcase
    const { real_name, profile } = requesterInfo;
    const requester = await User.findOrCreate({
      where: { slackId: id },
      defaults: { name: real_name, email: profile.email },
      raw: true
    });
    return {
      requesterId: requester[0].id
    };
  }

  static async newRequest(name, dateTime, department, payload, requestData) {
    const {
      originId, destinationId, requesterId, passengerId
    } = requestData;

    const newRequest = await TripRequest.create({
      riderId: payload.submission.rider ? passengerId : requesterId,
      name,
      departmentId: department,
      tripStatus: 'Pending',
      departureTime: dateTime,
      requestedById: requesterId,
      originId,
      destinationId
    });
    return newRequest;
  }

  static async createRequest(payload, respond) {
    let requestId;
    let requestData = {};
    try {
      const {
        pickup, dateTime, destination, department
      } = payload.submission;
      const { id } = payload.user;

      // find or create origin and destination addresses
      const originAndDestination = await ScheduleTripController.originAndDestination(
        pickup,
        destination
      );
      requestData = { ...requestData, ...originAndDestination };

      // find or create user being requested for
      const passengerId = await ScheduleTripController.getPassengerId(payload);
      requestData = { ...requestData, ...passengerId };

      // find or create the user who is requesting
      const requesterId = await ScheduleTripController.getRequesterId(id);
      requestData = { ...requestData, ...requesterId };

      // create new request
      const name = `From ${pickup} to ${destination} on ${dateTime}`;
      const newRequest = await ScheduleTripController.newRequest(
        name,
        dateTime,
        department,
        payload,
        requestData
      );

      requestId = newRequest.dataValues.id;
      SlackEvents.raise(slackEventsNames.NEW_TRIP_REQUEST, newRequest.dataValues, respond);
    } catch (error) {
      throw error;
    }
    return requestId;
  }
}

export default ScheduleTripController;
