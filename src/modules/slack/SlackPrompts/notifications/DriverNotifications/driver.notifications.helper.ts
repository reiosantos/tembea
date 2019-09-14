import {
  SlackText, TextTypes, Block, BlockMessage, BlockTypes,
} from '../../../../new-slack/models/slack-block-models';
import { getSlackDateString } from '../../../helpers/dateHelpers';
import { ITripInformation } from '../../../../../database/models/interfaces/trip.interface';

export default class DriverNotificationHelper {
  /**
   Returns a trip Attachment to be sent to driver
   * @param {object} trip object
   */
  static tripApprovalAttachment(trip: ITripInformation) {
    const {
      origin, destination, rider: { slackId, phoneNo },
      departureTime, distance, department: { name }, driverSlackId, noOfPassengers,
    } = trip;
    const fields: SlackText[] = [
      new SlackText(`*Take Off time* \n ${getSlackDateString(departureTime)}`,
                    TextTypes.markdown),
      new SlackText(`*Passenger* \n  <@${slackId}> `, TextTypes.markdown),
      new SlackText(`*Department* \n ${name}`, TextTypes.markdown),
      new SlackText(`*PickUp Location* \n ${origin.address}`, TextTypes.markdown),
      new SlackText(`*Destination* \n ${destination.address}`, TextTypes.markdown),
      new SlackText(`*No of Passengers* \n ${noOfPassengers}`, TextTypes.markdown),
      new SlackText(`*Phone Number*\n ${phoneNo || 'N/A'}`, TextTypes.markdown),
      new SlackText(`*Distance* ${distance}`, TextTypes.markdown)];
    const header = new Block(BlockTypes.section)
      .addText(new SlackText('*New Trip Notification*', TextTypes.markdown));
    const body = new Block(BlockTypes.section)
      .addText(new SlackText(`Hey <@${driverSlackId}> You have an upcoming trip :smiley:`,
                             TextTypes.markdown))
      .addFields(fields);
    const blocks = [header, body];
    return new BlockMessage(blocks);
  }
}
