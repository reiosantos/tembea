import models from '../../../database/models';
import SendNotifications from '../SlackPrompts/Notifications';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import TeamDetailsService from '../../../services/TeamDetailsService';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import CabService from '../../../services/CabService';

const { TripRequest } = models;

class TripActionsController {
  static getErrorMessage() {
    return { text: 'Dang, something went wrong there.' };
  }

  static runCabValidation(payload) {
    if (payload.submission.confirmationComment) {
      const errors = [];
      const err = UserInputValidator.validateCabDetails(payload);
      errors.push(...err);
      return errors;
    }
  }

  static async changeTripStatus(payload) {
    try {
      const { user: { id: userId }, team: { id: teamId } } = payload;
      const [ops, slackBotOauthToken] = await Promise.all([
        SlackHelpers.findOrCreateUserBySlackId(userId, teamId),
        TeamDetailsService.getTeamDetailsBotOauthToken(teamId)
      ]);
      const { id: opsUserId } = ops;
      if (payload.submission.confirmationComment) {
        return TripActionsController.changeTripStatusToConfirmed(
          opsUserId, payload, slackBotOauthToken
        );
      } if (payload.submission.opsDeclineComment) {
        return TripActionsController.changeTripStatusToDeclined(
          opsUserId, payload, slackBotOauthToken
        );
      }
    } catch (error) {
      bugsnagHelper.log(error);
      return TripActionsController.getErrorMessage();
    }
  }

  static async changeTripStatusToConfirmed(opsUserId, payload, slackBotOauthToken) {
    const {
      submission: {
        confirmationComment, driverName, driverPhoneNo, regNumber
      },
      team: { id: teamId },
      user: { id: userId },
      state: payloadState
    } = payload;

    const { tripId, timeStamp, channel } = JSON.parse(payloadState);

    const cab = await CabService.findOrCreateCab(driverName, driverPhoneNo, regNumber);

    await TripRequest.update({
      tripStatus: 'Confirmed',
      operationsComment: confirmationComment,
      confirmedById: opsUserId,
      cabId: cab.id
    }, { where: { id: tripId } });
    const trip = await SlackHelpers.getTripRequest(tripId);
    await TripActionsController.sendAllNotifications(teamId, userId, trip,
      timeStamp, channel, slackBotOauthToken);
    return 'success';
  }

  static async sendAllNotifications(teamId, userId, trip, timeStamp, channel,
    slackBotOauthToken, isDecline = false) {
    await Promise.all([
      SendNotifications.sendUserConfirmOrDeclineNotification(teamId, userId, trip,
        isDecline),
      SendNotifications.sendManagerConfirmOrDeclineNotification(teamId, userId, trip,
        isDecline),
      InteractivePrompts.sendOpsDeclineOrApprovalCompletion(isDecline, trip, timeStamp, channel,
        slackBotOauthToken)
    ]);
  }

  static async changeTripStatusToDeclined(opsUserId, payload, slackBotOauthToken) {
    const {
      submission: { opsDeclineComment },
      team: { id: teamId },
      user: { id: userId },
      channel: { id: channelId },
      state: payloadState
    } = payload;

    const { trip: stateTrip, actionTs } = JSON.parse(payloadState);
    const tripId = Number(stateTrip);

    await TripRequest.update({
      tripStatus: 'DeclinedByOps',
      operationsComment: opsDeclineComment,
      declinedById: opsUserId
    }, { where: { id: tripId } });
    const trip = await SlackHelpers.getTripRequest(tripId);
    await TripActionsController.sendAllNotifications(teamId, userId, trip,
      actionTs, channelId, slackBotOauthToken, true);
    return 'success';
  }
}
export default TripActionsController;
