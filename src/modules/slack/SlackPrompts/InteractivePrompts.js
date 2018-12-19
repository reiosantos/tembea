import {
  SlackInteractiveMessage, SlackSelectActionWithSlackContent,
  SlackAttachment, SlackButtonAction, SlackCancelButtonAction,
  SlackButtonsAttachmentFromAList, SlackAttachmentField, SlackSelectAction
} from '../SlackModels/SlackMessageModels';
import Notifications from './Notifications';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import createNavButtons from '../../../helpers/slack/navButtons';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import InteractivePromptsHelpers from '../helpers/slackHelpers/InteractivePromptsHelpers';

const web = new WebClientSingleton();

class InteractivePrompts {
  static sendBookNewTripResponse(payload, respond) {
    const attachment = new SlackAttachment();

    // main buttons
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('yes', 'For Me', 'true'),
      new SlackButtonAction('no', 'For Someone', 'false')
    ]);

    attachment.addOptionalProps('book_new_trip');

    // add navigation buttons
    const navAttachment = createNavButtons('back_to_launch', 'back_to_launch');

    const message = new SlackInteractiveMessage('Who are you booking for?',
      [attachment, navAttachment]);

    respond(message);
  }

  static sendCompletionResponse(payload, respond, requestId) {
    const requester = payload.user.id;
    const rider = payload.submission.rider || 'self';

    const attachment = new SlackAttachment();
    attachment.addFieldsOrActions('actions', [
      // sample button actions
      new SlackButtonAction('view', 'View', `${requester} ${rider}`),
      new SlackButtonAction('reschedule', 'Reschedule ', requestId),
      new SlackCancelButtonAction('Cancel Trip', requestId,
        'Are you sure you want to cancel this trip', 'cancel_trip'),
      new SlackCancelButtonAction()
    ]);

    attachment.addOptionalProps('itinerary_actions');

    const message = new SlackInteractiveMessage('Success! Your request has been submitted.', [
      attachment
    ]);
    respond(message);
  }

  static sendRescheduleCompletion(trip) {
    const attachments = new SlackAttachment();
    attachments.addFieldsOrActions('actions', [
      new SlackButtonAction('view', 'View', 'view'),
      new SlackButtonAction('reschedule', 'Reschedule ', trip.dataValues.id),
      new SlackCancelButtonAction('Cancel Trip', trip.dataValues.id,
        'Are you sure you want to cancel this trip', 'cancel_trip'),
      new SlackCancelButtonAction()
    ]);
    attachments.addOptionalProps('itinerary_actions');
    return new SlackInteractiveMessage('Success! Your request has been submitted.', [attachments]);
  }

  static sendRescheduleError(trip) {
    const attachments = new SlackAttachment();
    attachments.addFieldsOrActions('actions', [
      new SlackButtonAction('reschedule', 'Try Again', trip.dataValues.id)
    ]);
    attachments.addOptionalProps('itinerary_actions');
    return new SlackInteractiveMessage('Oh! I was unable to save this trip', [attachments]);
  }

  static sendTripError() {
    return new SlackInteractiveMessage('Dang! I hit an error with this trip');
  }

  static sendTripItinerary(payload, respond) {
    const attachment = new SlackAttachment();

    // main buttons
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('history', 'Trip History', 'view_trips_history'),
      new SlackButtonAction('upcoming', 'Upcoming Trips ', 'view_upcoming_trips')
    ]);

    attachment.addOptionalProps('trip_itinerary', 'fallback', '#FFCCAA', 'default');

    // add navigation buttons
    const navAttachment = createNavButtons('back_to_launch', 'back_to_launch');

    const message = new SlackInteractiveMessage('Please choose an option', [
      attachment,
      navAttachment
    ]);
    respond(message);
  }

  static sendUpcomingTrips(trips, respond, payload) {
    const attachments = [];
    trips.forEach(trip => InteractivePrompts.formatUpcomingTrip(trip, payload, attachments));
    const navButtonsAttachment = createNavButtons(
      'welcome_message', 'view_trips_itinerary'
    );
    const message = new SlackInteractiveMessage(
      'Your Upcoming Trips', [...attachments, navButtonsAttachment]
    );
    respond(message);
  }

  static formatUpcomingTrip(trip, payload, attachments) {
    const { id } = payload.user;
    const attachment = new SlackAttachment();
    const journey = `From ${trip['origin.address']} To ${trip['destination.address']}`;
    const time = `Departure Time:  ${trip.departureTime}`;
    const requestedBy = id === trip['requester.slackId']
      ? `Requested By: ${trip['requester.name']} (You)`
      : `Requested By: ${trip['requester.name']}`;

    const rider = id !== trip['rider.slackId'] || id !== trip['requester.slackId']
      ? `Rider: ${trip['rider.name']}`
      : null;

    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(journey, time)]);
    attachment.addFieldsOrActions('fields', [new SlackAttachmentField(requestedBy, rider)]);
    attachment.addFieldsOrActions('actions', [
      new SlackButtonAction('reschedule', 'Reschedule ', trip.id),
      new SlackCancelButtonAction(
        'Cancel Trip',
        trip.id,
        'Are you sure you want to cancel this trip',
        'cancel_trip'
      )
    ]);
    attachment.addOptionalProps('itinerary_actions');
    attachments.push(attachment);
    return attachments;
  }

  /**
   * @description Replaces the trip notification message with an approval or decline message
   * @param  {boolean} decline Is this a decline or approval?
   * @param  {Object} tripInformation The object containing all the trip information
   * @param  {string} timeStamp The timestamp of the trip request notification
   * @param  {string} channel The channel id to which the notification was sent
   * @param {string} slackBotOauthToken The team bot token
   */
  static sendManagerDeclineOrApprovalCompletion(decline, tripInformation, timeStamp, channel, slackBotOauthToken) {
    const requester = tripInformation.requester.dataValues;
    const attachments = [
      new SlackAttachment(decline ? 'Trip Declined' : 'Trip Approved'),
      new SlackAttachment(
        decline
          ? ':x: You have declined this trip'
          : ':white_check_mark: You have approved this trip'
      )
    ];
    const fields = Notifications.notificationFields(
      tripInformation
    );

    attachments[0].addOptionalProps('callback');
    attachments[1].addOptionalProps('callback');
    attachments[0].addFieldsOrActions('fields', fields);

    InteractivePrompts.messageUpdate(
      channel,
      (decline
        ? `You have just declined the trip from <@${requester.slackId}>`
        : `You have just approved the trip from <@${requester.slackId}>`),
      timeStamp,
      attachments,
      slackBotOauthToken
    );
  }


  /**
   * @description Update a previously sent message
   * @param  {string} channel The channel to which the original message was sent
   * @param  {string} text The message text
   * @param  {string} timeStamp The time stamp of the original message
   * @param  {array} attachments The attachments
   * @param {string} slackBotOauthToken The team bot token
   */
  static messageUpdate(channel, text, timeStamp, attachments, slackBotOauthToken) {
    web.getWebClient(slackBotOauthToken).chat.update({
      channel,
      text,
      ts: timeStamp,
      attachments
    });
  }

  /**
   * @description Replaces the trip notification on the ops channel with an approval or decline
   * @param  {boolean} decline
   * @param  {Object} tripInformation
   * @param  {string} timeStamp
   * @param  {string} channel
   */
  static sendOpsDeclineOrApprovalCompletion(decline, tripInformation, timeStamp, channel) {
    const tripDetailsAttachment = new SlackAttachment(decline ? 'Trip Declined' : 'Trip Confirmed');
    const confirmationDetailsAttachment = new SlackAttachment(
      decline
        ? `:X: <@${tripInformation.decliner.dataValues.slackId}> declined this request`
        : `:white_check_mark: <@${tripInformation.confirmer.slackId}> approved this request`
    );
    const cabDetailsAttachment = !decline
      ? InteractivePromptsHelpers.generateCabDetailsAttachment(tripInformation)
      : {};

    confirmationDetailsAttachment.addOptionalProps('', '', (decline ? 'danger' : 'good'));
    tripDetailsAttachment.addOptionalProps('', '', '#3c58d7');
    tripDetailsAttachment.addFieldsOrActions('fields',
      InteractivePromptsHelpers.addOpsNotificationTripFields(tripInformation));

    InteractivePrompts.messageUpdate(channel,
      (decline ? 'Trip request declined.' : 'Trip request approved'),
      timeStamp,
      [tripDetailsAttachment,
        cabDetailsAttachment,
        confirmationDetailsAttachment]);
  }

  static passedTimeOutLimit() {
    return new SlackInteractiveMessage(
      'Sorry! this trip cant be rescheduled one hour prior the pick-up time'
    );
  }

  static rescheduleConfirmedError() {
    return new SlackInteractiveMessage('Sorry! This trip request can no longer be rescheduled');
  }

  static sendTripHistory(tripHistory, respond) {
    const attachments = [];
    const formatTrip = (trip) => {
      const tripAttachment = new SlackAttachment(
        '', `*Date*: ${trip.departureTime}`, '', '', '', '', 'good'
      );
      tripAttachment.addMarkdownIn(['text']);
      tripAttachment.addFieldsOrActions('fields', [
        new SlackAttachmentField('Pickup Location', `${trip['origin.address']}`, 'true'),
        new SlackAttachmentField('Destination', `${trip['destination.address']}`, 'true')
      ]);
      attachments.push(tripAttachment);
    };

    tripHistory.forEach(trip => formatTrip(trip));
    const text = '*Your trip history for the last 30 days*';
    const navButtonsAttachment = createNavButtons(
      'welcome_message', 'view_trips_itinerary'
    );
    const message = new SlackInteractiveMessage(text, [...attachments, navButtonsAttachment]);
    respond(message);
  }

  static sendRiderSelectList(payload, respond) {
    const attachments = new SlackAttachment();

    attachments.addFieldsOrActions('actions', [
      new SlackSelectActionWithSlackContent('rider', 'Select a rider')
    ]);
    attachments.addOptionalProps('schedule_trip_rider');

    // add navigation buttons
    const navAttachment = createNavButtons('welcome_message', 'book_new_trip');

    const message = new SlackInteractiveMessage('Who are you booking the ride for?',
      [attachments, navAttachment], payload.channel.id, payload.user.id);

    respond(message);
  }

  static async sendListOfDepartments(payload, respond, forSelf = true) {
    const personify = forSelf ? 'your' : 'rider\'s';
    const attachment = SlackButtonsAttachmentFromAList.createAttachments(
      await SlackHelpers.getDepartments(), 'schedule_trip_department'
    );

    // Navigate to the number of passengers
    attachment.push(createNavButtons('schedule_trip_rider'));

    const message = new SlackInteractiveMessage(`*Please select ${personify} department.*`,
      attachment, payload.channel.id, payload.user.id);

    respond(message);
  }

  static sendAddPassengersResponse(respond, forSelf = true) {
    const attachment = new SlackAttachment();
    const passengerNumbers = SlackHelpers.noOfPassengers();

    attachment.addFieldsOrActions('actions', [
      new SlackSelectAction('addPassenger', 'No. of passengers', passengerNumbers),
      new SlackButtonAction('no', 'No', 1)]);

    attachment.addOptionalProps('schedule_trip_addPassengers');

    /* if rider is self navigate to for me/for someone option when 'Back' is clicked,
       else navigate to 'select rider' option
    */
    const navAttachment = createNavButtons(forSelf ? 'welcome_message' : 'schedule_trip_reason', 'book_new_trip');

    const message = new SlackInteractiveMessage(
      'Any more passengers?', [attachment, navAttachment]
    );
    respond(message);
  }
}

export default InteractivePrompts;
