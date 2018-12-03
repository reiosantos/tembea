import sendTripRequestNotification from './SendTripRequestNotification';

class SlackNotifications {
  static notifyNewTripRequests(payload, tripId) {
    const { submission, user, channel } = payload;
    const {
      department, dateTime, destination, rider, pickup
    } = submission;

    let newDate;
    if (dateTime) {
      const date = dateTime.split(/\//);
      newDate = [date[1], date[0], date[2]].join('/');
    }

    const riderId = rider || user.id;

    const submissionData = {
      riderId,
      requesterId: user.id,
      department,
      destination,
      pickup,
      requestDate: new Date(),
      departureDate: newDate,
      requestStatus: 'Pending'
    };
    return sendTripRequestNotification(tripId, user, channel, submissionData);
  }
}

export default SlackNotifications;
