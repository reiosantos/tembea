import { Op } from 'sequelize';
import moment from 'moment';
import models from '../database/models';
import Cache from '../cache';
import { MAX_INT as all } from '../helpers/constants';
import HttpError from '../helpers/errorHandler';
import UserService from './UserService';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import RouteServiceHelper from '../helpers/RouteServiceHelper';
import BaseService from './BaseService';
import RemoveDataValues from '../helpers/removeDataValues';
import appEvents from '../modules/events/app-event.service';
import { routeEvents } from '../modules/events/route-events.constants';

const {
  Route, RouteBatch, Cab, Address, User, sequelize, Sequelize, Driver, Homebase, Country
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
      homebase: { model: Homebase, as: 'homebase' },
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
      {
        model: Homebase, as: 'homebase', attributes: ['id', 'name'], include: [{ model: Country, as: 'country', attributes: ['name', 'id', 'status'] }]
      }
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
    return ['id', 'status', 'capacity', 'takeOff', 'batch', 'comments', 'homebaseId'];
  }

  /**
   * Returns a list of default groupBy values (required)
   *
   * @readonly
   * @static
   * @memberof RouteService
   */
  static get defaultRouteGroupBy() {
    return ['RouteBatch.id', 'cabDetails.id', 'route.id', 'route->destination.id', 'driver.id', 'homebase.id', 'homebase->country.name', 'homebase->country.id'];
  }

  /**
   * @param {{
   *     name:string, destinationName:string, vehicleRegNumber:string, capacity:number,
   *     takeOff:string, comments:string, imageUrl:string }} data
   * @return {Promise<Route>}
   * @see RouteRequestService#serializeRouteBatch for sample of the object returned
   * @throws {Error}
   */
  async createRouteBatch(data, first = false) {
    const {
      routeId, capacity, status, takeOff, providerId
    } = data;
    const route = await this.findById(routeId);
    const routeBatchObject = {
      batch: await RouteService.updateBatchLabel({ route, created: first }),
      routeId,
      capacity,
      status,
      takeOff,
      providerId
    };

    const batch = await RouteService.createBatch(routeBatchObject);

    appEvents.broadcast({
      name: routeEvents.newRouteBatchCreated,
      data: batch
    });

    return batch;
  }

  static async createBatch(batchDetails) {
    const batch = await RouteBatch.create(batchDetails);
    return batch;
  }

  static async createRoute({ name, imageUrl, destinationId }) {
    const batchInfo = { model: RouteBatch, as: 'routeBatch' };
    const [route, created] = await Route.findOrCreate({
      where: { name: { [Op.iLike]: `${name}%` } },
      defaults: { name, imageUrl, destinationId },
      order: [[batchInfo, 'createdAt', 'DESC']],
      include: [batchInfo]
    });
    return { route: route.dataValues, created };
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

  static async getBatches(filter) {
    const batches = await RouteBatch.findAll(
      {
        where: {
          status: {
            [Op.eq]: `${filter.status}`
          },
          cabId: {
            [Op.ne]: null
          },
          driverId: {
            [Op.ne]: null
          }
        }
      }
    );
    return RemoveDataValues.removeDataValues(batches);
  }

  static async getRouteById(id, withFks = false) {
    let include;
    if (withFks) {
      include = ['routeBatch'];
    }
    const route = await Route.findByPk(id, { include });
    return RemoveDataValues.removeDataValues(route);
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
   * @see RouteService#getRouteById for sample return data
   * @throws {Error}
   */
  static async updateRouteBatch(id, data) {
    const [, [route]] = await RouteBatch.update(data,
      { returning: true, where: { id } });
    return route;
  }

  /**
   * Retrieves route batch details by id.
   * @param id
   * @param {Boolean} withFks
   * @return {Promise<Route|*>}
   * @private
   * @throws {Error}
   */
  static async getRouteBatchByPk(id, withFks = false) {
    if (!id) return null;
    let include;
    if (withFks) {
      include = ['riders', ...RouteService.defaultInclude];
    }
    const batch = await RouteBatch.findByPk(id, { include });
    return RemoveDataValues.removeDataValues(batch);
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
  static async getRoutes(pageable = RouteService.defaultPageable, where = {}, homebaseId) {
    const { page, size, sort } = pageable;
    let [order, filter] = [];
    if (sort) { order = [...RouteService.convertToSequelizeOrderByClause(sort)]; }
    if (where && where.status) {
      filter = { where: { status: where.status, homebaseId } };
    } else { filter = { where: { homebaseId } }; }
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

  static async updateBatchLabel({ route, created }) {
    let batch = 'A';
    if (!created) {
      // Get the latest route batch
      const fullRoute = await RouteService.getRouteById(route.id, true);
      ({ batch } = fullRoute.routeBatch[fullRoute.routeBatch.length - 1]);
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
      return [
        RouteService.defaultInclude[0],
        RouteService.defaultInclude[1],
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
