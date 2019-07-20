import { Op } from 'sequelize';
import moment from 'moment';
import models from '../database/models';
import Cache from '../cache';
import { MAX_INT as all } from '../helpers/constants';
import AddressService from './AddressService';
import HttpError from '../helpers/errorHandler';
import UserService from './UserService';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import RouteServiceHelper from '../helpers/RouteServiceHelper';
import BaseService from './BaseService';

const {
  Route, RouteBatch, Cab, Address, User, sequelize, Sequelize, Driver
} = models;

class RouteService extends BaseService {
  constructor() {
    super(Route);
  }

  static get sort() {
    return {
      cab: { model: Cab, as: 'cabDetails' },
      route: { model: Route, as: 'route' },
      riders: { model: User, as: 'riders' },
      destination: { model: Address, as: 'destination' },
    };
  }

  static get defaultPageable() {
    return {
      page: 1, size: all, sort: SequelizePaginationHelper.deserializeSort('id,asc')
    };
  }

  static get defaultInclude() {
    return [
      {
        model: Cab, as: 'cabDetails'
      },
      {
        model: Driver, as: 'driver'
      },
      {
        model: Route, as: 'route', include: ['destination']
      },
    ];
  }

  /**
   * Returns a list of route default details (required)
   *
   * @readonly
   * @static
   * @memberof RouteService
   */
  static get defaultRouteDetails() {
    return ['id', 'status', 'capacity', 'takeOff', 'batch', 'comments'];
  }

  /**
   * Returns a list of default groupBy values (required)
   *
   * @readonly
   * @static
   * @memberof RouteService
   */
  static get defaultRouteGroupBy() {
    return ['RouteBatch.id', 'cabDetails.id', 'route.id', 'route->destination.id', 'driver.id'];
  }

  /**
   * @param {{
   *     name:string, destinationName:string, vehicleRegNumber:string, capacity:number,
   *     takeOff:string, comments:string, imageUrl:string }} data
   * @return {Promise<Route>}
   * @see RouteRequestService#serializeRouteBatch for sample of the object returned
   * @throws {Error}
   */
  static async createRouteBatch(data) {
    const {
      name, imageUrl, destinationName, ...batchDetails
    } = data;
    const destination = await AddressService.findAddress(destinationName);
    const routeDetails = await RouteService.createRoute(name, imageUrl, destination);
    const { route } = routeDetails;

    batchDetails.batch = RouteService.updateBatchLabel(routeDetails);
    const routeId = route.id;
    const batch = await RouteService.createBatch(batchDetails, routeId);
    route.destination = destination;
    batch.route = route;
    return batch;
  }

  static async createBatch(batchDetails, routeId, cabId, driverId) {
    const batch = await RouteBatch.create({
      ...batchDetails, routeId, cabId, driverId
    });
    return batch;
  }

  static async createRoute(name, imageUrl, destination) {
    const batchInfo = { model: RouteBatch, as: 'routeBatch' };
    const [route, created] = await Route.findOrCreate({
      where: { name: { [Op.iLike]: `${name}%` } },
      defaults: { name, imageUrl, destinationId: destination.id },
      order: [[batchInfo, 'createdAt', 'DESC']],
      include: [batchInfo]
    });
    return { route, created };
  }

  /**
   *
   * @param routeBatchId
   * @param userId
   * @return {Promise<void>}
   * @throws {Error}
   */
  static async addUserToRoute(routeBatchId, userId) {
    const route = await RouteBatch.findByPk(routeBatchId, { include: ['riders'] });
    HttpError.throwErrorIfNull(route, 'Route route not found');
    if (!RouteServiceHelper.canJoinRoute(route)) {
      HttpError.throwErrorIfNull(null, 'Route capacity has been exhausted', 403);
    }
    const updateUserTable = UserService.getUserById(userId)
      .then(user => user.update({ routeBatchId: route.id }));
    const updateRoute = await route.update({ inUse: route.riders.length + 1 });
    await Cache.saveObject(`Route_${updateRoute.id}`, { updateRoute });

    await sequelize.transaction(() => Promise.all([updateUserTable, updateRoute]));
  }

  static async getRoute(id) {
    let route;
    const result = await Cache.fetch(`Route_${id}`);
    if (result && result.route) {
      ({ route } = result);
    } else {
      route = await RouteService.getRouteBatchByPk(id);
      await Cache.saveObject(`Route_${route.id}`, { route });
    }
    return route;
  }

  async getRouteByName(name) {
    const route = await this.findOne({ name });
    return route;
  }

  /**
   * Updates the a given route batch information by id and update cache
   * @param id
   * @param {
   *    {
   *      capacity:number, takeOff:string, comments:string
   *      status: 'Active' | 'Inactive',
   *    }
   * } data
   * @return {Promise<>}
   * @see RouteService#getRoute for sample return data
   * @throws {Error}
   */
  static async updateRouteBatch(id, data) {
    const route = await RouteService.getRouteBatchByPk(id);
    HttpError.throwErrorIfNull(route, 'Route Batch not found');

    await route.update(data);
    await Cache.save(`Route_${route.id}`, 'route', route);
    return route;
  }

  /**
   * Retrieves route batch details by id.
   * @param id
   * @param {Array} includes
   * @return {Promise<Route|*>}
   * @private
   * @throws {Error}
   */
  static async getRouteBatchByPk(id, includes) {
    let include;
    if (!includes) {
      include = ['riders', ...RouteService.defaultInclude];
    }
    return RouteBatch.findByPk(id, { include });
  }

  /**
   * @description Get's paginated route records from db, if page and size are not provided
   * it fetches all the record in the database.
   * @param {{object}} where - Sequelize options.
   * @param {{ page:number, size:number, [sort]:Array }} pageable
   * @returns {object} An array of addresses
   * @example RouteService.getAllRouteByPage(
   *  { status: 'Active' },
   *  { page:1, size:10, sort:['id','desc'] }
   * );
   */
  static async getRoutes(pageable = RouteService.defaultPageable, where = {}) {
    const { page, size, sort } = pageable;
    let [order, filter] = [];
    if (sort) { order = [...RouteService.convertToSequelizeOrderByClause(sort)]; }
    if (where && where.status) { filter = { where: { status: where.status } }; }
    const paginatedRoutes = new SequelizePaginationHelper(RouteBatch, filter, size);
    paginatedRoutes.filter = {
      ...filter,
      subQuery: false,
      order,
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('riders.routeBatchId')), 'inUse'],
        ...RouteService.defaultRouteDetails
      ],
      include: [...RouteService.updateDefaultInclude(where), { model: User, as: 'riders', attributes: [] }],
      group: [...RouteService.defaultRouteGroupBy]
    };
    const { data, pageMeta } = await paginatedRoutes.getPageItems(page);
    const routes = data.map(RouteServiceHelper.serializeRouteBatch);
    return { routes, ...pageMeta };
  }

  static updateBatchLabel({ route, created }) {
    let batch = 'A';
    if (!created) {
      // Get the latest route batch
      ([{ batch }] = route.routeBatch);
      const batchDigit = batch.charCodeAt(0) + 1;
      batch = String.fromCharCode(batchDigit);
    }
    return batch;
  }

  static convertToSequelizeOrderByClause(sort) {
    return sort.map((item) => {
      const { predicate, direction } = item;
      let order = [predicate, direction];
      if (RouteServiceHelper.isCabFields(predicate)) {
        order.unshift(RouteService.sort.cab);
      }
      if (predicate === 'destination') {
        order = [RouteService.sort.route, RouteService.sort.destination, 'address', direction];
      }
      if (predicate === 'name') {
        order.unshift(RouteService.sort.route);
      }
      return order;
    });
  }

  /**
   * deletes a route batch by its id
   * @return {Promise<number>}
   * @param routeBatchId
   */
  static async deleteRouteBatch(routeBatchId) {
    return RouteBatch.destroy({
      where: {
        id: routeBatchId
      }
    });
  }

  /**
   * redefines defaultInclude
   * @param where
   * @return {array} containing the updated default include
   * @private
   */
  static updateDefaultInclude(where) {
    if (where && where.name) {
      return [RouteService.defaultInclude[0],
        {
          model: Route,
          as: 'route',
          include: ['destination'],
          where: {
            name: { [Op.iLike]: `%${where.name}%` }
          }
        }];
    }
    return RouteService.defaultInclude;
  }

  static async RouteRatings(from, to) {
    const previousMonthStart = moment().subtract(1, 'months').date(1).format('YYYY-MM-DD');
    const previousMonthEnd = moment().subtract(1, 'months').endOf('month')
      .format('YYYY-MM-DD');
    let query = `
      SELECT BUR.id AS "BatchUseRecordID", BUR.rating, RUR.id AS "RouteRecordID",
      RB.id As "RouteBatchID", RB.batch As "RouteBatchName", R.name As "Route", R.id As "RouteID",
      RUR."batchUseDate" FROM "BatchUseRecords" AS BUR
      INNER JOIN "RouteUseRecords" AS RUR ON BUR."batchRecordId" = RUR.id
      INNER JOIN "RouteBatches" AS RB ON RUR."batchId" = RB.id
      INNER JOIN "Routes" AS R ON RB."routeId" = R.id
      WHERE BUR.rating IS NOT NULL 
      `;
    const filterByDate = ` AND RUR."batchUseDate" >= '${from || previousMonthStart}' 
    AND RUR."batchUseDate" <= '${to || previousMonthEnd}'`;
    query += filterByDate;
    const results = await sequelize.query(query);
    return results;
  }
}

export const routeService = new RouteService();
export default RouteService;
