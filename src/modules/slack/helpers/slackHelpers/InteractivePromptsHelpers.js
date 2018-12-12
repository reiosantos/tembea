import { SlackAttachmentField, SlackAttachment } from '../../SlackModels/SlackMessageModels';
import Utils from '../../../../utils';

class InteractivePromptsHelpers {
  /**
   * @description This function generates the trip details fields
   * @param  {object} tripInfo The trip info
   * @returns {array} The fields array
   */
  static addOpsNotificationTripFields(tripInfo) {
    const requester = tripInfo.requester.dataValues;
    const department = tripInfo.department.dataValues;
    const rider = tripInfo.rider.dataValues;
    const pickup = tripInfo.origin.dataValues.address;
    const destination = tripInfo.destination.dataValues.address;

    return [
      new SlackAttachmentField('Requested By', `<@${requester.slackId}>`, true),
      new SlackAttachmentField('Department', department.name, true),
      new SlackAttachmentField('Rider', `<@${rider.slackId}>`, true),
      new SlackAttachmentField('Pickup Location', pickup, true),
      new SlackAttachmentField('Destination', destination, true),
      new SlackAttachmentField('Request Date',
        Utils.formatDate(tripInfo.createdAt), true),
      new SlackAttachmentField('Trip Date',
        Utils.formatDate(tripInfo.departureTime), true)
    ];
  }

  /**
   * @description This function generates the cab details fields
   * @param  {object} cabInfo The cab info
   * @returns {array} The fields array
   */
  static addOpsNotificationCabFields(cabInfo) {
    const { driverName, driverPhoneNo, regNumber } = cabInfo;

    return [
      new SlackAttachmentField('Driver\'s Name', driverName, true),
      new SlackAttachmentField('Driver\'s Number', driverPhoneNo, true),
      new SlackAttachmentField('Car\'s Reg Number', regNumber, true)
    ];
  }

  /**
   * @description Generate cab details attachment
   * @param  {bool} decline Was this trip declined
   * @param  {object} tripInformation the trip request information
   */
  static generateCabDetailsAttachment(tripInformation) {
    const cab = tripInformation.cab.dataValues;
    const cabDetailsAttachment = new SlackAttachment('Cab Details');
    cabDetailsAttachment.addOptionalProps('', '', '#3c58d7');
    cabDetailsAttachment.addFieldsOrActions('fields',
      InteractivePromptsHelpers.addOpsNotificationCabFields(cab));
    return cabDetailsAttachment;
  }

  static formatTripHistory(tripHistory) {
    const attachments = [];
    const formatTrip = (trip) => {
      const tripAttachment = new SlackAttachment('', `*Date*: ${trip.departureTime}`,
        '', '', '', '', 'good');
      tripAttachment.addMarkdownIn(['text']);
      tripAttachment.addFieldsOrActions('fields', [
        new SlackAttachmentField(
          'Pickup Location', `${trip['origin.address']}`, 'true'
        ),
        new SlackAttachmentField(
          'Destination', `${trip['destination.address']}`, 'true'
        )
      ]);
      attachments.push(tripAttachment);
    };

    tripHistory.forEach(trip => formatTrip(trip));
    return attachments;
  }
}

export default InteractivePromptsHelpers;
