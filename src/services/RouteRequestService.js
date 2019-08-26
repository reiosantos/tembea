import database from '../database';
import TeamDetailsService from './TeamDetailsService';
import { getRequest } from './SerivceUtils';
import RemoveDataValues from '../helpers/removeDataValues';

const { models } = database;
const {
  RouteRequest, Engagement, Cab, Address, Country
} = models;

class RouteRequestService {
  static async findByPk(id, withFks = false) {
    const include = withFks ? RouteRequestService.defaultInclude : [];
    const route = await RouteRequest.findByPk(id, { include });
    return RemoveDataValues.removeDataValues(route);
  }

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
    busStopDistance, requesterId
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
      requesterId
    });
  }

  /**
   * Get a specific route request by id from cache or database. It returns a readonly data model;
   * to update the route information use {@link RouteRequestService#update}
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
    return getRequest(id, 'Route', RouteRequestService.getRouteRequestByPk);
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
  static async update(id, data) {
    const [, [result]] = await RouteRequest.update(data,
      { returning: true, where: { id } });
    return RemoveDataValues.removeDataValues(result);
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
    const routeRequest = await RouteRequest.findByPk(id, { include });
    return routeRequest;
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
  static async getAllConfirmedRouteRequests(homebaseId) {
    return RouteRequest.findAll({
      where: { status: 'Confirmed', homebaseId },
      include: RouteRequestService.defaultInclude
    });
  }

  static async getCabCapacity(regNumber) {
    const cab = await Cab.findOne({
      where: { regNumber },
      attributes: ['id', 'capacity']
    });
    return cab && cab.dataValues ? cab.dataValues.capacity : 0;
  }
}

RouteRequestService.defaultInclude = ['opsReviewer', 'manager',
  {
    model: Engagement,
    as: 'engagement',
    include: ['partner', 'fellow'],
  },
  {
    model: Address,
    as: 'busStop',
    include: ['location']
  },
  {
    model: Address,
    as: 'home',
    include: ['location']
  },
  {
    model: models.Homebase,
    as: 'homebase',
    attributes: ['id', 'name'],
    include: [{ model: Country, as: 'country', attributes: ['name', 'id', 'status'] }]
  }
];
export default RouteRequestService;
