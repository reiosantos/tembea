import {
  SlackAttachmentField
} from '../../SlackModels/SlackMessageModels';
import { GoogleMapsDistanceMatrix, SlackHelpers } from '../../RouteManagement/rootFile';

export default class PreviewScheduleTrip {
  static async getRider(riderId) {
    if (riderId) {
      const rider = await SlackHelpers.findUserByIdOrSlackId(riderId);
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
      new SlackAttachmentField('Passenger\'s Name', `${passengerName}`, true),
      new SlackAttachmentField('Number of Passengers', passengers, true),
      new SlackAttachmentField('Requester (Trip)', userName, true),
      new SlackAttachmentField('Pickup Location', pickup, true),
      new SlackAttachmentField('Destination', destination, true),
      new SlackAttachmentField('Pick-Up Date/Time', dateTime, true),
      new SlackAttachmentField('Department', department.name, true),
      new SlackAttachmentField('Reason for Trip', reason, true),
    ];
  }

  static async previewScheduleTripAttachments(tripDetails) {
    const {
      pickup, destination, pickupLat, destinationLat, passengers, department, forSelf,
      dateTime, reason, rider, name, pickupLong, destinationLong
    } = tripDetails;
    const userName = PreviewScheduleTrip.formatName(name);
    const passengerName = forSelf === 'true' ? userName : (await PreviewScheduleTrip.getRider(rider)).name;

    const userDetails = {
      passengerName, passengers, userName, pickup, destination, dateTime, department, reason
    };
    
    if (pickupLat && destinationLat) {
      const origins = `${pickupLat}, ${pickupLong}`;
      const destinations = `${destinationLat}, ${destinationLong}`;
      const { distanceInKm } = await GoogleMapsDistanceMatrix
        .calculateDistance(origins, destinations);
      const result = [...PreviewScheduleTrip.returnPreview(userDetails)];
      result.push(new SlackAttachmentField('Distance', distanceInKm, true));
      return result;
    }
    return PreviewScheduleTrip
      .returnPreview(userDetails);
  }
}
