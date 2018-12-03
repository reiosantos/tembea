import Sequelize from 'sequelize';
import models from '../../../database/models';

const { TripRequest, User, Address } = models;
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
    attributes: ['name']
  }
];

class TripItineraryController {
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
      const trips = await TripRequest.findAll({
        raw: true,
        where: {
          [Op.or]: [{ riderId: userId }, { requestedById: userId }],
          tripStatus: {
            [Op.or]: tripStatus
          }
        },
        include: includeQuery
      });
      return trips;
    } catch (error) {
      throw error;
    }
  }
}

export default TripItineraryController;
