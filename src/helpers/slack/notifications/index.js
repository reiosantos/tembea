import sendTripRequestNotification from './SendTripRequestNotification';

class SlackNotifications {
  static notifyNewTripRequests(payload) {
    const { submission, user, channel } = payload;

    const submissionData = {
      riderId: submission.rider,
      requesterName: user.name,
      department: submission.department,
      destination: submission.destination,
      pickup: submission.pickup,
      requestDate: new Date(),
      departureDate: submission.date_time,
      requestStatus: 'Pending',
    };
    return sendTripRequestNotification(user, channel, submissionData);
  }
}

export default SlackNotifications;
