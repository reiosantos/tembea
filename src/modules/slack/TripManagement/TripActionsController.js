import Sequelize from 'sequelize';
import models from '../../../database/models';
import SendNotifications from '../SlackPrompts/Notifications';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import TeamDetailsService from '../../../services/TeamDetailsService';
import bugsnagHelper from '../../../helpers/bugsnagHelper';

const { TripRequest, Cab } = models;
const { Op } = Sequelize;

class TripActionsController {
  static errorMessage(respond) {
    respond({ text: 'Dang, something went wrong there.' });
  }

  static runCabValidation(payload) {
    if (payload.submission.confirmationComment) {
      const errors = [];
      const err = UserInputValidator.validateCabDetails(payload);
      errors.push(...err);
      return errors;
    }
  }

  static async changeTripStatus(payload, respond) {
    try {
      const { user: { id }, team: { id: teamId } } = payload;
      const [ops, slackBotOauthToken] = await Promise.all([
        SlackHelpers.findOrCreateUserBySlackId(id, teamId),
        TeamDetailsService.getTeamDetailsBotOauthToken(teamId)
      ]);
      const { id: opsUserId } = ops;
      if (payload.submission.confirmationComment) {
        await TripActionsController.changeTripStatusToConfirmed(
          opsUserId, payload, respond, slackBotOauthToken
        );
      } else if (payload.submission.opsDeclineComment) {
        await TripActionsController.changeTripStatusToDeclined(
          opsUserId, payload, respond, slackBotOauthToken
        );
      }
    } catch (error) {
      bugsnagHelper.log(error);
      TripActionsController.errorMessage(respond);
    }
  }

  static async changeTripStatusToConfirmed(opsUserId, payload, respond, slackBotOauthToken) {
    const { tripId, timeStamp, channel } = JSON.parse(payload.state);
    const { confirmationComment } = payload.submission;
    try {
      const cab = await TripActionsController.addCabDetails(payload, respond);

      await TripRequest.update({
        tripStatus: 'Confirmed',
        operationsComment: confirmationComment,
        confirmedById: opsUserId,
        cabId: cab.id,
      }, { where: { id: tripId } });
      const trip = await SlackHelpers.getTripRequest(tripId);
      await Promise.all([
        SendNotifications.sendUserConfirmOrDeclineNotification(payload, trip, false),
        SendNotifications.sendManagerConfirmOrDeclineNotification(payload, trip, false),
        InteractivePrompts.sendOpsDeclineOrApprovalCompletion(
          false, trip, timeStamp, channel, slackBotOauthToken
        )
      ]);
      return 'success';
    } catch (error) {
      bugsnagHelper.log(error);
      TripActionsController.errorMessage(respond);
    }
  }

  static async changeTripStatusToDeclined(opsUserId, payload, respond, slackBotOauthToken) {
    const state = JSON.parse(payload.state);
    const tripId = Number(state.trip);
    const { opsDeclineComment } = payload.submission;
    try {
      await TripRequest.update({
        tripStatus: 'DeclinedByOps',
        operationsComment: opsDeclineComment,
        declinedById: opsUserId
      }, { where: { id: tripId } });
      const trip = await SlackHelpers.getTripRequest(tripId);
      await Promise.all([
        SendNotifications.sendUserConfirmOrDeclineNotification(payload, trip, true),
        SendNotifications.sendManagerConfirmOrDeclineNotification(payload, trip, true),
        InteractivePrompts.sendOpsDeclineOrApprovalCompletion(
          true, trip, state.actionTs, payload.channel.id, slackBotOauthToken
        )
      ]);
      return 'success';
    } catch (error) {
      bugsnagHelper.log(error);
      TripActionsController.errorMessage(respond);
    }
  }

  static async addCabDetails(payload, respond) {
    const { driverName, driverPhoneNo, regNumber } = payload.submission;
    try {
      const cab = await Cab.findOrCreate({
        where: {
          [Op.or]: [{ driverPhoneNo }, { regNumber }]
        },
        defaults: {
          driverName,
          driverPhoneNo,
          regNumber,
        }
      });

      return cab[0].dataValues;
    } catch (error) {
      bugsnagHelper.log(error);
      TripActionsController.errorMessage(respond);
    }
  }
}
export default TripActionsController;
