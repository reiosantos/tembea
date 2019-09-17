import sequelize from 'sequelize';
import database from '../database';
import RemoveDataValues from '../helpers/removeDataValues';
import aisService from './AISService';

const {
  models: {
    BatchUseRecord, RouteUseRecord, User, Route, RouteBatch
  }
} = database;

class RouteStatistics {
  /**
   * Updates the a given route batch information by id and update cache
   * @param order
   * @param startDate
   * @param endDate
   * @return {Promise<>}
   * @throws {Error}
   */
  static async getFrequentRiders(order, startDate, endDate, homebaseId) {
    try {
      const data = await BatchUseRecord.findAll({
        attributes: [
          'userId', 'batchRecordId', [sequelize.fn('count', sequelize.col('userId')), 'userCount']
        ],
        where: {
          userAttendStatus: 'Confirmed',
          createdAt: { [sequelize.Op.between]: [startDate, endDate] }
        },
        limit: 5,
        include: [...RouteStatistics.includeUsersOnRouteQuery(homebaseId)],
        group: [
          'BatchUseRecord.batchRecordId', 'BatchUseRecord.userId', 'user.id',
          'batchRecord.id', 'batchRecord->batch.id', 'batchRecord->batch->route.id'
        ],
        order: [[sequelize.fn('count', sequelize.col('userId')), order]]
      });
      return RemoveDataValues.removeDataValues(data);
    } catch (error) { return error.message; }
  }

  static includeUsersOnRouteQuery(homebaseId) {
    return [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
      {
        model: RouteUseRecord,
        as: 'batchRecord',
        attributes: ['batchId'],
        include: [
          {
            model: RouteBatch,
            as: 'batch',
            attributes: ['batch'],
            include: [
              {
                model: Route,
                as: 'route',
                attributes: ['name'],
                where: { homebaseId }
              }]
          }]
      }];
  }

  static async getUserPicture(email) {
    const defaultProfilePicture = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    const details = await aisService.getUserDetails(email);
    return details && details.picture ? details.picture : defaultProfilePicture;
  }

  static async addUserPictures(payload) {
    return Promise.all(
      payload.map(async (data) => {
        const topArray = { ...data };
        topArray.picture = await RouteStatistics.getUserPicture(data.user.email);
        return topArray;
      })
    );
  }

  /**
   * Updates the a given route batch information by id and update cache
   * @param order
   * @param startDate
   * @return {Promise<>}
   * @throws {Error}
   */

  static async getTopAndLeastFrequentRiders(startDate, endDate, homeBaseId) {
    try {
      const top = await RouteStatistics.getFrequentRiders('DESC', startDate, endDate, homeBaseId);

      const firstFiveMostFrequentRiders = await RouteStatistics.addUserPictures(top);

      const bottom = await RouteStatistics.getFrequentRiders('ASC', startDate, endDate, homeBaseId);

      const leastFiveFrequentRiders = await RouteStatistics.addUserPictures(bottom);

      const data = {
        firstFiveMostFrequentRiders,
        leastFiveFrequentRiders
      };

      return data;
    } catch (error) {
      return error.message;
    }
  }
}

export default RouteStatistics;
