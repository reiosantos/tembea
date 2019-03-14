import { Op } from 'sequelize';
import models from '../database/models';
import Cache from '../cache';
import { MAX_INT as all } from '../helpers/constants';
import AddressService from './AddressService';
import HttpError from '../helpers/errorHandler';
import UserService from './UserService';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import CabService from './CabService';

const {
  Route, RouteBatch, Cab, Address, User, sequelize
} = models;

class RouteService {
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
    return ['cabDetails',
      {
        model: Route, as: 'route', include: ['destination']
      },
    ];
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
      name, imageUrl, destinationName, vehicleRegNumber, ...batchDetails
    } = data;

    const destination = await AddressService.findAddress(destinationName);
    const routeDetails = await RouteService.createRoute(name, imageUrl, destination);
    const { route } = routeDetails;
    const cabDetails = await CabService.findOrCreate(vehicleRegNumber);

    batchDetails.batch = RouteService.updateBatchLabel(routeDetails);
    const routeId = route.id;
    const batch = await RouteService.createBatch(batchDetails, routeId, cabDetails.id);
    batch.cabDetails = cabDetails;
    route.destination = destination;
    batch.route = route;
    return RouteService.serializeRouteBatch(batch);
  }

  static async createBatch(batchDetails, routeId, cabId) {
    const batch = await RouteBatch.create({
      ...batchDetails,
      routeId,
      cabId
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
    if (!RouteService.canJoinRoute(route)) {
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

  static async getRouteByName(name) {
    const route = await Route.findOne({ where: { name } });
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
  static async getRoutes(pageable = RouteService.defaultPageable, where = null) {
    const { page, size, sort } = pageable;
    let order;
    if (sort) {
      const convert = RouteService.convertToSequelizeOrderByClause(sort);
      order = [...convert];
    }
    let filter;
    if (where) {
      filter = { where: { status: where.status } };
    }
    const paginatedRoutes = new SequelizePaginationHelper(RouteBatch, filter, size);
    paginatedRoutes.filter = {
      ...filter, subQuery: false, order, include: RouteService.updateDefaultInclude(where)
    };
    const { data, pageMeta } = await paginatedRoutes.getPageItems(page);
    const routes = data.map(RouteService.serializeRouteBatch);
    return {
      routes, ...pageMeta
    };
  }

  static canJoinRoute(route) {
    return route.riders && route.riders.length < route.capacity;
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
      if (RouteService.isCabFields(predicate)) {
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

  static isCabFields(predicate) {
    return predicate === 'driverName' || predicate === 'driverPhoneNo' || predicate === 'regNumber';
  }

  static serializeRider(rider) {
    if (!rider) return {};
    const { slackId, id, email } = rider;
    return { slackId, id, email };
  }

  static serializeRiders(data) {
    if (!data) return {};
    const riders = data.map(RouteService.serializeRider);
    const inUse = riders.length;
    return { inUse, riders };
  }

  static serializeRoute(route) {
    if (!route) return {};
    const { name, destination: { address: destination } } = route;
    return { name, destination };
  }

  static serializeCabDetails(cabDetails) {
    if (cabDetails) {
      const { driverName, driverPhoneNo, regNumber } = cabDetails;
      return { driverName, driverPhoneNo, regNumber };
    }
    return {};
  }

  /**
   * @private
   * @param routeData
   * @return {
   *    {
   *      regNumber:string, takeOff:string, driverPhoneNo:string, inUse:string, name: string,
   *      destination:string, batch:string, driverName:string, id:number, status:string,
   *      capacity:number, riders: Array<{email:string,slackId:string,id:number}>
   *    }
   *  }
   */
  static serializeRouteBatch(routeData) {
    const {
      id, status, takeOff, capacity, batch, comments, inUse, imageUrl, routeId,
    } = routeData;
    return {
      id,
      status,
      imageUrl,
      takeOff,
      capacity,
      batch,
      comments,
      routeId,
      inUse: inUse || 0,
      ...RouteService.serializeRoute(routeData.route),
      ...RouteService.serializeCabDetails(routeData.cabDetails),
      ...RouteService.serializeRiders(routeData.riders),
    };
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
    if (!(where && where.name)) {
      return RouteService.defaultInclude;
    }
    return [RouteService.defaultInclude[0],
      {
        model: Route,
        as: 'route',
        include: ['destination'],
        where: {
          name: { [Op.like]: `%${where.name}%` }
        }
      }];
  }
}

export default RouteService;
