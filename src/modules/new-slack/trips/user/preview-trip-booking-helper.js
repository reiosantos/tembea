import NewSlackHelpers from '../../helpers/slack-helpers';
import { SlackText, TextTypes } from '../../models/slack-block-models';
import { GoogleMapsDistanceMatrix, Cache } from '../../../slack/RouteManagement/rootFile';
import { getTripKey } from '../../../../helpers/slack/ScheduleTripInputHandlers';
import { getSlackDateString } from '../../../slack/helpers/dateHelpers';

export default class PreviewTripBooking {
  static async getRider(riderId) {
    if (riderId) {
      const rider = await NewSlackHelpers.findUserByIdOrSlackId(riderId);
      if (rider) {
        return rider;
      }
      return { name: '' };
    }
  }

  static formatName(name) {
    if (typeof name === 'string') {
      return name.split('.').map(txt => `${txt[0].toUpperCase()}${txt.substr(1)}`).join(' ');
    }
  }

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
    const { name } = await this.getRider(rider);
    return name;
  }

  static async getDistance(pickupLat, pickupLong, destLat, destLong) {
    const origins = `${pickupLat}, ${pickupLong}`;
    const destinations = `${destLat}, ${destLong}`;
    const {
      distanceInKm
    } = await GoogleMapsDistanceMatrix
      .calculateDistance(origins, destinations);
    return distanceInKm;
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
    const userName = PreviewTripBooking.formatName(name);
    const passengerName = forMe ? userName : (await PreviewTripBooking.getRiderName(rider));
    const userDetails = {
      passengerName, passengers, userName, pickup, destination, dateTime, department, reason
    };
    const preview = PreviewTripBooking.returnPreview(userDetails);
    if (pickupLat && destinationLat) {
      const distance = await PreviewTripBooking
        .getDistance(pickupLat, pickupLong, destinationLat, destinationLong);
      await PreviewTripBooking.saveDistance(tripDetails, distance);
      const previewData = PreviewTripBooking.previewDistance(distance, preview);
      return previewData;
    }
    return preview;
  }
}
