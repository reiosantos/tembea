import moment from 'moment-timezone';
import tripService from '../../../../services/TripService';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import {
  SlackAttachment,
  SlackAttachmentField,
  SlackButtonAction,
  SlackInteractiveMessage
} from '../../SlackModels/SlackMessageModels';
import UserService from '../../../../services/UserService';

export default class ViewTripHelper {
  /**
   * Displays an interactive prompt for trip details when a user books a new trip
   * @return {Promise<*>}
   * @param requestId
   * @param userId
   */
  static async displayTripRequest(requestId, userId) {
    try {
      const tripRequest = await tripService.getById(requestId);
      const { riderId } = tripRequest;
      const { slackId } = await UserService.getUserById(riderId);
      const message = ViewTripHelper.tripAttachment(tripRequest, userId, slackId);
      return message;
    } catch (error) {
      bugsnagHelper.log(error);
      return new SlackInteractiveMessage('Request unsuccessful.:cry:');
    }
  }

  static tripAttachmentFields(tripRequest, passSlackId, slackId, timezone) {
    const {
      noOfPassengers, reason, tripStatus, origin, destination,
      departureTime, tripType, createdAt, tripNote
    } = tripRequest;

    const requestedOn = moment(createdAt).tz(timezone)
      .format('ddd, MMM Do YYYY hh:mm a');
    const pickupTime = moment(departureTime).tz(timezone)
      .format('ddd, MMM Do YYYY hh:mm a');

    const { address: pickUpLocation } = origin;
    const { address: destinationAddress } = destination;
    const fromField = new SlackAttachmentField('*Pickup Location*', pickUpLocation, true);
    const toField = new SlackAttachmentField('*Destination*', destinationAddress, true);
    const passengerField = new SlackAttachmentField('*Passenger*', `<@${passSlackId}>`, true);
    const requestedByField = new SlackAttachmentField('*Requested By*', `<@${slackId}>`, true);
    const statusField = new SlackAttachmentField('*Trip Status*', tripStatus, true);
    const noOfPassengersField = new SlackAttachmentField('*No Of Passengers*', noOfPassengers, true);
    const reasonField = new SlackAttachmentField('*Reason*', reason, true);
    const requestDateField = new SlackAttachmentField('*Request Date*', requestedOn, true);
    const departureField = new SlackAttachmentField('*Trip Date*', pickupTime, true);
    const tripTypeField = new SlackAttachmentField('*Trip Type*', tripType, true);
    const tripNoteField = new SlackAttachmentField('*Trip Notes*', tripNote, true);
    return [fromField, toField, requestedByField, passengerField, noOfPassengersField,
      reasonField, requestDateField, departureField, statusField, tripTypeField, tripNoteField];
  }

  static tripAttachment(tripRequest, SlackId, passSlackId, timezone = 'Africa/Nairobi') {
    const { id } = tripRequest;
    const attachment = new SlackAttachment('Trip Information');
    const done = new SlackButtonAction('done', 'Done', id);
    const attachmentFields = ViewTripHelper.tripAttachmentFields(
      tripRequest, passSlackId, SlackId, timezone
    );
    attachment.addFieldsOrActions('fields', attachmentFields);
    attachment.addFieldsOrActions('actions', [done]);
    attachment.addOptionalProps('view_new_trip', 'Trip Information', '#3359DF');
    const greeting = `Hey, <@${SlackId}> below are your trip request details :smiley:`;
    const message = new SlackInteractiveMessage(greeting, [attachment]);
    return message;
  }
}
