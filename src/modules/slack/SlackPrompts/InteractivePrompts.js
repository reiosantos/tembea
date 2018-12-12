import {
  SlackInteractiveMessage, SlackSelectActionWithSlackContent,
  SlackAttachment, SlackButtonAction, SlackCancelButtonAction,
  SlackButtonsAttachmentFromAList, SlackAttachmentField, SlackSelectAction
} from '../SlackModels/SlackMessageModels';
import Notifications from './Notifications';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import createNavButtons from '../../../helpers/slack/navButtons';
import SlackHelpers from '../../../helpers/slack/slackHelpers';

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

  static sendDeclineCompletion(tripInformation, timeStamp, channel) {
    const requester = tripInformation.requester.dataValues;
    const attachments = [
      new SlackAttachment('Trip Declined'),
      new SlackAttachment(':x: You have declined this trip')
    ];
    const fields = Notifications.notificationFields(
      tripInformation
    );

    attachments[0].addOptionalProps('callback');
    attachments[1].addOptionalProps('callback');
    attachments[0].addFieldsOrActions('fields', fields);

    web.getWebClient().chat.update({
      channel,
      text: `You have just declined the trip from <@${requester.slackId}>`,
      ts: timeStamp,
      attachments
    });
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
