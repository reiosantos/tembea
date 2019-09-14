import Notifications from '../../Notifications';
import driverNotificationsHelper from './driver.notifications.helper';
import TeamDetailsService from '../../../../../services/TeamDetailsService';
import { bugsnagHelper, SlackInteractiveMessage } from '../../../RouteManagement/rootFile';
import DriverService from '../../../../../services/DriverService';
import { SlackText } from '../../../../new-slack/models/slack-block-models';
import { ITripInformation } from '../../../../../database/models/interfaces/trip.interface';
import { IDriver } from '.../../../database/models/interfaces/driver.interface';

class DriverNotifications {
  /**
   * Sends Driver notification for trip Assigned
   * @param {string} teamId to get team bot token
   * @param {object} trip requested approved
   * @param {string} driverSlackId of the driver assigned
   */
  static async sendDriverTripApproveNotification(teamId: string, trip: ITripInformation,
                                                 driverSlackId: string) {
    const tripData = { ...trip, driverSlackId };
    const slackBotOauthToken = await TeamDetailsService.getTeamDetailsBotOauthToken(teamId);
    const attachment = driverNotificationsHelper.tripApprovalAttachment(tripData);
    const imResponse = await Notifications.getDMChannelId(driverSlackId, slackBotOauthToken);
    const message = Notifications.createDirectMessage(
        imResponse, '',
        attachment,
      );
    return Notifications.sendNotification(message, slackBotOauthToken);
  }

  /**
   Check if the driver has a slack Id and a notification is send to them
   * @param {object} driver request object from slack
   * @param {String} teamId to get team bot token
   * @param {object} trip
   */
  static async checkAndNotifyDriver(driver: IDriver, teamId: string,
                                    trip: ITripInformation, respond: Function) {
    try {
      const { userId, id } = driver;
      if (userId) {
        const { user: { slackId: driverSlackId } } = await DriverService.findOneDriver(
        { where: { id } },
      );
        const message = new
        SlackInteractiveMessage(':white_check_mark: I have notified the driver'
        + ` <@${driverSlackId}> :smiley:`);
        await DriverNotifications.sendDriverTripApproveNotification(teamId, trip, driverSlackId);
        respond(message);
      }
      return;
    }catch (e) {
      bugsnagHelper.log(e);
      respond(new SlackInteractiveMessage(':X: Sorry I could not notify the driver'
      + ' but completed the trip approval' + ':slightly_frowning_face:'));
    }

  }
}

export default DriverNotifications;
