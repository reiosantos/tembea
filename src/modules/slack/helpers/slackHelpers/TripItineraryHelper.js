import Sequelize from 'sequelize';
import models from '../../../../database/models';
import SlackHelpers from '../../../../services/UserService';
import tripService from '../../../../services/TripService';

const { User, Address } = models;
const { Op } = Sequelize;
const includeQuery = [
  {
    model: Address,
    as: 'origin',
    attributes: ['address']
  },
  {
    model: Address,
    as: 'destination',
    attributes: ['address']
  },
  {
    model: User,
    as: 'requester',
    attributes: ['name', 'slackId']
  },
  {
    model: User,
    as: 'rider',
    attributes: ['name', 'slackId']
  }
];

class TripItineraryHelper {
  /**
   * @static async getTripRequests
   * @description This method queries the DB for either upcoming trips or trip history
   * @param {*} userId
   * @param {string} [requestType='upcoming']
   * @returns tripRequest
   * @memberof TripItineraryController
   */
  static async getTripRequests(userId, requestType = 'upcoming') {
    try {
      const upcomingTripStatus = ['Pending', 'Approved', 'Confirmed'];

      const tripStatus = requestType === 'upcoming' ? upcomingTripStatus : ['Confirmed'];
      const trips = await tripService.getAll(
        {
          where: {
            [Op.or]: [{ riderId: userId }, { requestedById: userId }],
            tripStatus: {
              [Op.or]: tripStatus
            }
          }
        }
      );
      return trips;
    } catch (error) {
      throw error;
    }
  }

  static async getUserIdBySlackId(slackId) {
    const user = await SlackHelpers.getUserBySlackId(slackId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.id;
  }

  static getThirtyDaysFromNow() {
    const difference = Date.now() - 2592000000;
    return difference;
  }

  static getTripItineraryFilters(requestType, userId, tripStatus) {
    const difference = TripItineraryHelper.getThirtyDaysFromNow();
    const filterTripsItinerary = {
      [Op.eq]: Sequelize.where(
        Sequelize.fn('date', Sequelize.col('departureTime')), requestType === 'upcoming'
          ? { [Op.gte]: Sequelize.fn('NOW') }
          : {
            [Op.and]: [
              { [Op.lte]: Sequelize.fn('NOW') }, { [Op.gte]: new Date(difference) }
            ]
          }
      ),
      [Op.or]: [{ riderId: userId }, { requestedById: userId }],
      tripStatus: { [Op.or]: tripStatus }
    };

    return filterTripsItinerary;
  }

  static async getPaginatedTripRequestsBySlackUserId(slackUserId,
    requestType = 'upcoming', pageNo) {
    const upcomingTripStatus = ['Pending', 'Approved', 'Confirmed'];
    const tripStatus = requestType === 'upcoming' ? upcomingTripStatus : ['Confirmed'];
    const userId = await TripItineraryHelper.getUserIdBySlackId(slackUserId);
    const tripItineraryFilters = TripItineraryHelper.getTripItineraryFilters(
      requestType, userId, tripStatus
    );
    const filters = {
      raw: true,
      where: tripItineraryFilters,
      include: includeQuery
    };
    const paginatedTrips = await tripService.getPaginatedTrips(filters, pageNo);
    return paginatedTrips;
  }
}

export default TripItineraryHelper;
