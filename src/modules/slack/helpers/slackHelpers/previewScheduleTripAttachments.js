import {
  SlackAttachmentField
} from '../../SlackModels/SlackMessageModels';
import { GoogleMapsDistanceMatrix, SlackHelpers } from '../../RouteManagement/rootFile';
import Cache from '../../../../cache';

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

  static stripDestinationCoords(destinationCoords) {
    let lat;
    let lng;
    if (destinationCoords.location) {
      const { location: { longitude, latitude } } = destinationCoords;
      lat = latitude;
      lng = longitude;
      return { lat, lng };
    }
    lat = destinationCoords.destinationLat;
    lng = destinationCoords.destinationLong;
    return { lat, lng };
  }

  static async getDistance(pickupLat, pickupLong, destCoords) {
    const { lat, lng } = PreviewScheduleTrip.stripDestinationCoords(destCoords);
    const origins = `${pickupLat}, ${pickupLong}`;
    const destinations = `${lat}, ${lng}`;
    const {
      distanceInKm
    } = await GoogleMapsDistanceMatrix
      .calculateDistance(origins, destinations);
    return distanceInKm;
  }

  static async saveDistance(tripDetails, distance) {
    const tripData = { ...tripDetails };
    tripData.distance = distance;
    await Cache.save(tripDetails.id, 'tripDetails', tripData);
  }

  static async previewScheduleTripForKnownLocations(pickupLat, pickupLong, destinationCoords,
    { userDetails, tripData }) {
    const distance = await PreviewScheduleTrip
      .getDistance(pickupLat, pickupLong, destinationCoords);
    const result = [...PreviewScheduleTrip.returnPreview(userDetails)];
    if (typeof distance === 'string' && distance !== 'unknown') {
      result.push(new SlackAttachmentField('Driving Distance', distance, true));
    }
    await PreviewScheduleTrip.saveDistance(tripData, distance);
    return result;
  }

  static async previewScheduleTripAttachments(tripDetails) {
    const {
      pickup, destination, pickupLat, destinationLat, passengers, department, forSelf,
      dateTime, reason, rider, name, pickupLong, destinationLong, destinationCoords,
      othersDestination
    } = tripDetails;
    const tripData = { ...tripDetails };
    const userName = PreviewScheduleTrip.formatName(name);
    const passengerName = forSelf === 'true' ? userName : (await PreviewScheduleTrip.getRider(rider)).name;
    const userDetails = {
      passengerName, passengers, userName, pickup, destination, dateTime, department, reason
    };
    if (!othersDestination) {
      return PreviewScheduleTrip
        .previewScheduleTripForKnownLocations(pickupLat, pickupLong, destinationCoords,
          { userDetails, tripData });
    }
    if (pickupLat && destinationLat) {
      const distance = await PreviewScheduleTrip
        .getDistance(pickupLat, pickupLong, { destinationLat, destinationLong });
      const result = [...PreviewScheduleTrip.returnPreview(userDetails)];
      result.push(new SlackAttachmentField('Distance', distance, true));
      await PreviewScheduleTrip.saveDistance(tripData, distance);
      return result;
    }
    return PreviewScheduleTrip.returnPreview(userDetails);
  }
}
