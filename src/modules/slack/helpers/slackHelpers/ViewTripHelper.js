import Utils from '../../../../utils';
import tripService from '../../../../services/TripService';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import {
  SlackAttachmentField, SlackAttachment, SlackInteractiveMessage, SlackButtonAction
} from '../../SlackModels/SlackMessageModels';
import UserService from '../../../../services/UserService';

export default class ViewTripHelper {
  /**
   * Displays an interactive prompt for trip details when a user books a new trip
   * @param {{ requestId:number, userId:number}} data
   * @return {Promise<*>}
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
      return new SlackInteractiveMessage('Request unsuccessfull.:cry:');
    }
  }

  static tripAttachmentFields(tripRequest, passSlackId, slackId) {
    const {
      noOfPassengers, reason, tripStatus, origin, destination,
      departureTime, tripType, createdAt
    } = tripRequest;
    const { address: pickUpLocation } = origin;
    const { address: destinationAddress } = destination;
    const fromField = new SlackAttachmentField('*Pickup Location*', pickUpLocation, true);
    const toField = new SlackAttachmentField('*Destination*', destinationAddress, true);
    const passengerField = new SlackAttachmentField('*Passenger*', `<@${passSlackId}>`, true);
    const requestedByField = new SlackAttachmentField('*Requested By*', `<@${slackId}>`, true);
    const statusField = new SlackAttachmentField('*Trip Status*', tripStatus, true);
    const noOfPassengersField = new SlackAttachmentField('*No Of Passengers*', noOfPassengers, true);
    const reasonField = new SlackAttachmentField('*Reason*', reason, true);
    const requestDateField = new SlackAttachmentField('*Request Date*', Utils.formatDate(createdAt), true);
    const departureField = new SlackAttachmentField('*Trip Date*', Utils.formatDate(departureTime), true);
    const tripTypeField = new SlackAttachmentField('*Trip Type*', tripType, true);
    return [fromField, toField, requestedByField, passengerField, noOfPassengersField,
      reasonField, requestDateField, departureField, statusField, tripTypeField];
  }

  static tripAttachment(tripRequest, SlackId, passSlackId) {
    const { id } = tripRequest;
    const attachment = new SlackAttachment('Trip Information');
    const done = new SlackButtonAction('done', 'Done', id);
    const attachmentFields = ViewTripHelper.tripAttachmentFields(tripRequest, passSlackId, SlackId);
    attachment.addFieldsOrActions('fields', attachmentFields);
    attachment.addFieldsOrActions('actions', [done]);
    attachment.addOptionalProps('view_new_trip', 'Trip Information', '#3359DF');
    const greeting = `Hey, <@${SlackId}> below is your trip request details :smiley:`;
    const message = new SlackInteractiveMessage(greeting, [attachment]);
    return message;
  }
}
