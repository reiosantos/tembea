import Sequelize from 'sequelize';
import models from '../../../database/models';
import SendNotifications from '../SlackPrompts/Notifications';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';

const { TripRequest, Cab } = models;
const { Op } = Sequelize;

class TripActionsController {
  static async changeTripStatus(payload, respond) {
    const { id } = payload.user;
    const { id: opsUserId } = await SlackHelpers.findUserByIdOrSlackId(id);
    if (payload.submission.confirmationComment) {
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
        respond({
          text: 'Dang, something went wrong there.'
        });
      }
    } else if (payload.submission.comment) {
      const state = JSON.parse(payload.state);
      const tripId = Number(state.trip);
      const { comment } = payload.submission;
      try {
        await TripRequest.update({
          tripStatus: 'DeclinedByOps',
          operationsComment: comment,
          declinedById: opsUserId
        }, { where: { id: tripId } });
        const trip = await SlackHelpers.getTripRequest(tripId);
        SendNotifications.sendUserNotification(payload, trip);
        SendNotifications.sendManagerNotification(payload, trip);
        InteractivePrompts.sendOpsDeclineOrApprovalCompletion(true, trip, state.actionTs, payload.channel.id);

        return 'success';
      } catch (error) {
        respond({
          text: 'Dang, something went wrong there.'
        });
      }
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
      respond({
        text: 'Dang, something went wrong there.'
      });
    }
  }
}
export default TripActionsController;
