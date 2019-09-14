import { Op } from 'sequelize';
import models from '../database/models';
import RemoveDataValues from '../helpers/removeDataValues';
import { departmentDataAttributes } from './DepartmentService';

const { TripRequest, Department } = models;

export default class TravelTripService {
  /**
   * @description queries the db for an array of travel trips statistics by department
   * @param  {string} startDate iso date string
   * @param  {string} endDate iso date string
   * @param  {array} departmentList - array of departments
   * @returns {object} travelTrips - array of travel trips statistics
   */
  static async getCompletedTravelTrips(startDate, endDate, departmentList, homeBaseToFilter) {
    let where = {};
    if (departmentList && departmentList.length) where = { name: { [Op.in]: [...departmentList] } };
    const travelTrips = await TripRequest.findAll({
      where: {
        homebaseId: homeBaseToFilter,
        tripStatus: 'Completed',
        [Op.or]: [{ tripType: 'Embassy Visit' }, { tripType: 'Airport Transfer' }],
        createdAt: { [Op.between]: [startDate, endDate], },
      },
      include: [{
        model: Department,
        as: 'department',
        required: true,
        attributes: [],
        where
      }],
      ...departmentDataAttributes
    });

    return RemoveDataValues.removeDataValues(travelTrips);
  }
}
