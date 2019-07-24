import moment from 'moment';
import Cache from '../cache';
import AddressService from '../services/AddressService';
import { getTripKey } from './slack/ScheduleTripInputHandlers';
import TripUtils from '../utils';

export default class TripHelper {
  static cleanDateQueryParam(query, field) {
    if (query[field]) {
      // departureTime sample data => after,2018-10-10;before,2018-01-10
      const [a, b] = query[field].split(';');
      return this.extracted222(a, b);
    }
  }

  static extracted222(a, b) {
    const result = {};
    const [key1, value1] = this.extracted(a || '');
    if (key1) {
      result[key1] = value1;
    }

    const [key2, value2] = this.extracted(b || '');
    if (key2) {
      result[key2] = value2;
    }
    return result;
  }

  static extracted(a) {
    const [key, value] = a.split(':');
    if (key) {
      return [key, value];
    }
    return [];
  }

  static async updateTripData(userId, name, pickup, othersPickup, dateTime,
    tripType = 'Regular Trip') {
    const userTripDetails = await Cache.fetch(getTripKey(userId));
    const userTripData = { ...userTripDetails };
    const pickupCoords = pickup !== 'Others'
      ? await AddressService.findCoordinatesByAddress(pickup) : null;
    if (pickupCoords) {
      userTripData.pickupId = pickupCoords.id;
      userTripData.pickupLat = pickupCoords.location.latitude;
      userTripData.pickupLong = pickupCoords.location.longitude;
    }
    userTripData.id = userId;
    userTripData.name = name;
    userTripData.pickup = pickup;
    userTripData.othersPickup = othersPickup;
    userTripData.dateTime = dateTime;
    userTripData.departmentId = userTripDetails.department.value;
    userTripData.tripType = tripType;
    return userTripData;
  }

  static async getDestinationCoordinates(destination, tripData) {
    const destinationCoords = destination !== 'Others'
      ? await AddressService.findCoordinatesByAddress(destination) : null;
    if (destinationCoords) {
      const { location: { longitude, latitude, id } } = destinationCoords;
      const tripDetails = { ...tripData };
      tripDetails.destinationLat = latitude;
      tripDetails.destinationLong = longitude;
      tripDetails.destinationId = id;
      return tripDetails;
    }
    return tripData;
  }

  /**
   * @description Converts approval date format to another format
   * @param {number} approvalDate the approval date in seconds
   * @returns {string} The new approval date in a user-friendly format
   */
  static convertApprovalDateFormat(approvalDate) {
    const approvalDateInMs = TripUtils.convertSecondsToMs(approvalDate);
    return moment(
      new Date(parseInt(approvalDateInMs, 10)), 'YYYY-MM-DD HH:mm:ss'
    ).toISOString();
  }

  /**
   * @method tripHasProvider
   * @param {object} trip
   * @returns {boolean} Returns true if trip has Provider, false otherwise
   */
  static tripHasProvider(trip) {
    return trip.providerId !== null;
  }

  /**
   * @method notConfirmingOrDecliningTrip
   * @param {Object} reqBody
   * @param {Object} trip
   * @param {String} action
   * @return {boolean} Returns true if the request is neither
   * for declining or confirming trip
   */
  static notConfirmingOrDecliningTrip(reqBody, trip, action) {
    return TripHelper.tripHasProvider(trip) && !action;
  }

  static async calculateSums(data) {
    const finalValues = { finalCost: 0, finalRating: 0, count: 0 };
    data.forEach((dataObject) => {
      finalValues.count += 1;
      finalValues.finalCost += parseInt(dataObject.totalCost, 10);
      finalValues.finalRating += parseFloat(dataObject.averageRating);
    });
    const { finalRating, count, finalCost } = finalValues;
    const finalAverageRating = (finalRating / count).toFixed(2);
    return { finalCost, finalAverageRating, count };
  }
}
