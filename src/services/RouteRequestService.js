import models from '../database/models';
import Cache from '../cache';
import TeamDetailsService from './TeamDetailsService';

const {
  RouteRequest, Engagement
} = models;

class RouteRequestService {
  /**
   *
   * @param {number} engagementId - user model of the fellow who is requesting for a new route
   * @param {number} managerId -  user model of the fellow's manager
   * @param {number} homeId - Sequelize model of the user's home address
   * @param {number} busStopId - address model of the closest bus chosen by the user
   * @param {string} routeImageUrl - Image url of the route show the path from the home address
   * to the bus stop
   * @param {string} opsComment - Operation teams comment
   * @param {string} managerComment - Manager's comment
   * @param {number} distance
   * @param {number} busStopDistance
   * @return {Promise<RouteRequest>}
   * @throws {Error}
   */
  static async createRoute({
    engagementId, managerId, homeId, busStopId, routeImageUrl, opsComment, managerComment, distance,
    busStopDistance
  }) {
    return RouteRequest.create({
      routeImageUrl,
      managerId,
      busStopId,
      homeId,
      engagementId,
      opsComment,
      managerComment,
      distance,
      busStopDistance,
      status: 'Pending',
    });
  }

  /**
   * Get a specific route request by id from cache or database. It returns a readonly data model;
   * to update the route information use {@link RouteRequestService#updateRouteRequest}
   * @param {number} id
   * @return {Promise<{
   *   id:number, distance:number, busStopDistance:number, status:string
   *   managerComment:string, opsComment:string,
   *   manager: {
   *      id:number, slackId:string, email:string,
   *   },
   *   busStop:{
   *     address:string, locationId:string
   *   },
   *   home:{
   *     address:string, locationId:string
   *   },
   *   engagement: {
   *     startDate:string, endDate:string, workHours:string,
   *     fellow: {
   *       id:number, slackId:string, email:string
   *     },
   *     partner: {
   *       name:string, id:number
   *     }
   *   }
   * }>}
   *
   * @throws {Error}
   */
  static async getRouteRequest(id) {
    let routeRequest;
    const result = await Cache.fetch(`RouteRequest_${id}`);
    if (result && result.routeRequest) {
      ({ routeRequest } = result);
    } else {
      routeRequest = await RouteRequestService.getRouteRequestByPk(id);
      await Cache.saveObject(`RouteRequest_${routeRequest.id}`, { routeRequest });
    }
    return routeRequest;
  }

  /**
   * Updates the a given route request information by id and update cache
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
   * @see RouteRequestService#getRouteRequest for sample return data
   * @throws {Error}
   */
  static async updateRouteRequest(id, data) {
    const routeRequest = await RouteRequestService.getRouteRequestByPk(id);
    await routeRequest.update(data);
    await Cache.save(`RouteRequest_${routeRequest.id}`, 'routeRequest', routeRequest);
    return routeRequest;
  }

  /**
   * Retrieves route request details by id.
   * @param id
   * @param {Array<string | object>} [include] list of database models to in fetch with the route
   * request model
   * @return {Promise<Promise<Model>|*>}
   * @private
   * @throws {Error}
   */
  static async getRouteRequestByPk(id, include = RouteRequestService.defaultInclude) {
    return RouteRequest.findByPk(id, { include });
  }

  static async getRouteRequestAndToken(routeRequestId, teamId) {
    const [slackBotOauthToken, routeRequest] = await Promise.all([
      TeamDetailsService.getTeamDetailsBotOauthToken(teamId),
      RouteRequestService.getRouteRequest(routeRequestId)
    ]);
    return { slackBotOauthToken, routeRequest };
  }

  /**
   * Retrieves all route requests
   * @returns {Promise<Promise<Array<Model>>|Promise<Instance[]>|Promise<TInstance[]>|*|Array>}
   */
  static async getAllConfirmedRouteRequests() {
    return RouteRequest.findAll({
      where: { status: 'Confirmed' },
      include: RouteRequestService.defaultInclude
    });
  }
}

RouteRequestService.defaultInclude = ['manager', 'busStop', 'home',
  {
    model: Engagement,
    as: 'engagement',
    include: ['partner', 'fellow'],
  }
];
export default RouteRequestService;
