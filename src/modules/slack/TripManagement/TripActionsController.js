import Sequelize from 'sequelize';
import models from '../../../database/models';
import SendNotifications from '../SlackPrompts/Notifications';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';

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
      const { id } = payload.user;
      const { id: opsUserId } = await SlackHelpers.findUserByIdOrSlackId(id);
      if (payload.submission.confirmationComment) {
        TripActionsController.changeTripStatusToConfirmed(opsUserId, payload, respond);
      } else if (payload.submission.opsDeclineComment) {
        TripActionsController.changeTripStatusToDeclined(opsUserId, payload, respond);
      }
    } catch (error) {
      TripActionsController.errorMessage(respond);
    }
  }

  static async changeTripStatusToConfirmed(opsUserId, payload, respond) {
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
      SendNotifications.sendUserConfirmNotification(payload, trip);
      SendNotifications.sendManagerConfirmNotification(payload, trip);
      InteractivePrompts.sendOpsDeclineOrApprovalCompletion(false, trip, timeStamp, channel);

      return 'success';
    } catch (error) {
      TripActionsController.errorMessage(respond);
    }
  }

  static async changeTripStatusToDeclined(opsUserId, payload, respond) {
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
      SendNotifications.sendUserConfirmOrDeclineNotification(payload, trip);
      SendNotifications.sendManagerConfirmOrDeclineNotification(payload, trip);
      InteractivePrompts.sendOpsDeclineOrApprovalCompletion(
        true, trip, state.actionTs, payload.channel.id
      );
      return 'success';
    } catch (error) {
      TripActionsController.errorMessage(respond);
      console.log(error);
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
      TripActionsController.errorMessage(respond);
    }
  }
}
export default TripActionsController;
