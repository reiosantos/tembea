import { SlackText, TextTypes } from '../../models/slack-block-models';
import {
  Cache
} from '../../../slack/RouteManagement/rootFile';
import { getTripKey } from '../../../../helpers/slack/ScheduleTripInputHandlers';
import { getSlackDateString } from '../../../slack/helpers/dateHelpers';
import PreviewScheduleTrip
  from '../../../slack/helpers/slackHelpers/previewScheduleTripAttachments';

export default class PreviewTripBooking {
  static returnPreview({
    passengerName, passengers, userName,
    pickup, destination, dateTime, department, reason
  }) {
    return [
      new SlackText(`*Passenger's Name* \n${passengerName}`, TextTypes.markdown),
      new SlackText(`*Number of Passengers* \n${passengers}`, TextTypes.markdown),
      new SlackText(`*Requester (Trip)* \n${userName}`, TextTypes.markdown),
      new SlackText(`*Pickup Location* \n${pickup}`, TextTypes.markdown),
      new SlackText(`*Destination* \n${destination}`, TextTypes.markdown),
      new SlackText(`*Pick-Up Date/Time* \n${getSlackDateString(dateTime)}`, TextTypes.markdown),
      new SlackText(`*Department* \n${department}`, TextTypes.markdown),
      new SlackText(`*Reason for Trip* \n${reason}`, TextTypes.markdown),
    ];
  }

  static async getRiderName(rider) {
    const { name } = await PreviewScheduleTrip.getRider(rider);
    return name;
  }

  static async saveDistance(tripData, distance) {
    await Cache.save(getTripKey(tripData.id), 'distance', distance);
  }

  static previewDistance(distance, preview) {
    if (distance && distance !== 'unknown') {
      preview.push(new SlackText(`*Distance* \n${distance}`, TextTypes.markdown));
      return preview;
    }
    return preview;
  }

  static async getPreviewFields(tripDetails) {
    const {
      pickup, destination, pickupLat, destinationLat, passengers, department, forMe,
      dateTime, reason, rider, name, pickupLong, destinationLong,
    } = tripDetails;
    const userName = PreviewScheduleTrip.formatName(name);
    const passengerName = forMe ? userName : (await PreviewTripBooking.getRiderName(rider));
    const preview = PreviewTripBooking.returnPreview({
      reason,
      passengers,
      userName,
      pickup,
      department,
      dateTime,
      destination,
      passengerName
    });
    if (pickupLat && destinationLat) {
      const distance = await PreviewScheduleTrip
        .getDistance(pickupLat, pickupLong, destinationLat, destinationLong);
      await PreviewTripBooking.saveDistance(tripDetails, distance);
      const previewData = PreviewTripBooking.previewDistance(distance, preview);
      return previewData;
    }
    return preview;
  }
}
