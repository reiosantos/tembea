import database from '../database';
import { bugsnagHelper } from '../modules/slack/RouteManagement/rootFile';
import { getRequest, updateRequest } from './SerivceUtils';

const {
  models: {
    JoinRequest, Engagement, RouteBatch, Route
  }
} = database;

class JoinRouteRequestService {
  /**
    *
    * @param {integer} engagementId
    * @param {integer} managerId
    * @param {integer} routeBatchId
    * @param {string} managerComment
    * @return {Promise<JoinRequest>}
    * @throws {Error}
 */
  static async createJoinRouteRequest(
    engagementId,
    managerId,
    routeBatchId,
    managerComment = ''
  ) {
    try {
      return JoinRequest.create({
        engagementId,
        managerId,
        routeBatchId,
        managerComment,
        status: 'Pending'
      });
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  /**
   * @param {integer} id
   * @return {Promise} {}
   * @throws {Error}
   */
  static async getJoinRouteRequest(id) {
    return getRequest(id, 'Join', JoinRouteRequestService.getJoinRouteRequestByPk);
  }

  /**
   * Retrieves join route request details by id.
   * @param id
   * @param {Array<string | object>} [include] list of database models to in fetch with the route
   * @return {Promise<Promise>}
   * @see JoinRouteRequestService#createJoinRouteRequest for sample return data
   * @throws {Error}
   */
  static async getJoinRouteRequestByPk(id, include = JoinRouteRequestService.defaultInclude) {
    return JoinRequest.findByPk(id, { include });
  }

  /**
   * Updates a join route request by id and updates cache
   * @param id
   * @param {
   *    {
   *      managerComment:string, opsComment:string, distance:number,
   *      status: 'Pending' | 'Declined' | 'Approved' | 'Confirmed',
   *      managerId:number, busStopId:number, homeId:number, engagementId:number,
   *      busStopDistance:number, routeImageUrl:string
   *    }
   * } data
   * @return {Promise<>}
   * @see JoinRouteRequestService#getJoinRouteRequest for sample return data
   * @throws {Error}
   */
  static async updateJoinRouteRequest(id, data) {
    return updateRequest(id, data,
      JoinRouteRequestService.getJoinRouteRequestByPk, 'Join', 'Route');
  }
}

JoinRouteRequestService.defaultInclude = ['manager',
  {
    model: Engagement,
    as: 'engagement',
    include: ['partner', 'fellow'],
  },
  {
    model: RouteBatch,
    as: 'routeBatch',
    include: ['riders', { model: Route, as: 'route', include: ['destination'] }]
  }
];
export default JoinRouteRequestService;
