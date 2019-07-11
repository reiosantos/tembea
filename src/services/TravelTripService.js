import { Op } from 'sequelize';
import models from '../database/models';
import RemoveDataValues from '../helpers/removeDataValues';

const { TripRequest, Department } = models;

export default class TravelTripService {
  /**
   * @description queries the db for an array of travel trips statistics by department
   * @param  {string} startDate iso date string
   * @param  {string} endDate iso date string
   * @param  {array} departmentList - array of departments
   * @returns {object} travelTrips - array of travel trips statistics
   */
  static async getCompletedTravelTrips(startDate, endDate, departmentList) {
    const travelTrips = await TripRequest.findAll({
      where: {
        tripStatus: 'Completed',
        [Op.or]: [{ tripType: 'Embassy Visit' }, { tripType: 'Airport Transfer' }],
        createdAt: { [Op.between]: [startDate, endDate], },
      },
      include: [{
        model: Department,
        as: 'department',
        required: true,
        attributes: [],
        where: { name: { [Op.in]: [...departmentList] } }
      }],
      attributes: [
        'departmentId',
        [models.sequelize.literal('department.name'), 'departmentName'],
        [models.sequelize.fn('count', models.sequelize.col('departmentId')), 'totalTrips'],
        [models.sequelize.fn('avg', models.sequelize.col('rating')), 'averageRating'],
        [models.sequelize.fn('sum', models.sequelize.col('cost')), 'totalCost'],
      ],
      group: ['department.id', 'TripRequest.departmentId'],
    });

    return RemoveDataValues.removeDataValues(travelTrips);
  }
}
