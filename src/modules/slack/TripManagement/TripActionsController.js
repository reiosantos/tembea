import tripService from '../../../services/TripService';
import SendNotifications from '../SlackPrompts/Notifications';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import TeamDetailsService from '../../../services/TeamDetailsService';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import ProviderNotifications from '../SlackPrompts/notifications/ProviderNotifications';
import TripHelper from '../../../helpers/TripHelper';
import SlackProviderHelper from '../helpers/slackHelpers/ProvidersHelper';
import DriverNotifications from
  '../SlackPrompts/notifications/DriverNotifications/driver.notifications';
import { driverService } from '../../../services/DriverService';

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

  /**
   * @method getTripNotificationDetails
   * @param {object} opsDetails
   * @return {object} Returns details that are useful for
   * notifying the Ops team head
   */
  static async getTripNotificationDetails(opsDetails) {
    const { user: { id: userId }, team: { id: teamId } } = opsDetails;
    const [ops, slackBotOauthToken] = await Promise.all([
      SlackHelpers.findOrCreateUserBySlackId(userId, teamId),
      TeamDetailsService.getTeamDetailsBotOauthToken(teamId)
    ]);
    return { ops, slackBotOauthToken };
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
      submission: { confirmationComment, providerId }, channel,
      state: payloadState
    } = payload;
    const { tripId, timeStamp } = JSON.parse(payloadState);
    let newPayload = { ...payload };
    const { providerUserSlackId, providerName } = await SlackProviderHelper.getProviderUserDetails(providerId);
    newPayload = { ...newPayload, submission: { ...newPayload.submission, providerUserSlackId, providerName } };
    const approvalDate = TripHelper.convertApprovalDateFormat(timeStamp);
    const trip = await tripService.updateRequest(tripId, {
      tripStatus: 'Confirmed',
      operationsComment: confirmationComment,
      confirmedById: opsUserId,
      providerId,
      approvalDate
    });
    await this.notifyAll(newPayload, trip, slackBotOauthToken, timeStamp, channel);
    return 'success';
  }

  /**
   * Handles the process of notifying the assigned provider and Ops
   *
   * @static
   * @param {Object} payload - The request payload
   * @param {Object} trip - The trip details
   * @param {string} slackBotOauthToken -  Slackbot auth token
   * @memberof TripActionsController
   */
  static async notifyAll(payload, trip, slackBotOauthToken, timeStamp, channel) {
    const {
      submission: { providerUserSlackId, providerName },
      team: { id: teamId },
      user: { id: userId },
    } = payload;

    await Promise.all([
      ProviderNotifications.sendTripNotification(providerUserSlackId, providerName, slackBotOauthToken, trip),
      InteractivePrompts.sendOpsDeclineOrApprovalCompletion(false, trip, timeStamp, channel,
        slackBotOauthToken),
      SendNotifications.sendManagerConfirmOrDeclineNotification(teamId, userId, trip, false),
      SendNotifications.sendUserConfirmOrDeclineNotification(teamId, userId, trip, false, true)
    ]);
  }

  static async completeTripRequest(payload, respond) {
    const {
      submission: {
        cab: cabId,
        driver: driverId
      },
      team: { id: teamId },
      user: { id: userId },
      state: payloadState,
    } = payload;
    const {
      tripId,
      timeStamp,
      channel,
    } = JSON.parse(payloadState);
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const trip = await tripService.updateRequest(tripId, { cabId, driverId });
    await ProviderNotifications.UpdateProviderNotification(channel, slackBotOauthToken, trip, timeStamp);
    await SendNotifications.sendUserConfirmOrDeclineNotification(teamId, userId, trip,
      false);
    await DriverNotifications.checkAndNotifyDriver(await driverService.findById(driverId),
      teamId, trip, respond);
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

    const trip = await tripService.updateRequest(tripId, {
      tripStatus: 'DeclinedByOps',
      operationsComment: opsDeclineComment,
      declinedById: opsUserId
    });
    await TripActionsController.sendAllNotifications(teamId, userId, trip,
      actionTs, channelId, slackBotOauthToken, true);

    return 'success';
  }
}

export default TripActionsController;
