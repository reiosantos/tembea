import moment from 'moment';
import { Op } from 'sequelize';
import models from '../database/models';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import Utils from '../utils';
import cache from '../cache';
import HttpError from '../helpers/errorHandler';
import SlackPagination from '../helpers/slack/SlackPaginationHelper';
import RemoveDataValues from '../helpers/removeDataValues';

const { TripRequest, Department } = models;
const getTripKey = pk => `tripDetail_${pk}`;

export class TripService {
  constructor() {
    this.defaultInclude = [
      'requester', 'origin', 'destination', 'rider', 'approver', 'confirmer',
      'department', 'decliner', 'cab', 'tripDetail', 'driver'
    ];
  }

  static sequelizeWhereClauseOption(filterParams) {
    const {
      departureTime, requestedOn, currentDay,
      status: tripStatus, department: departmentName,
      type: tripType
    } = filterParams;
    let where = {};

    if (tripStatus) where = { tripStatus };
    if (departmentName) where = { ...where, departmentName };
    if (tripType) where = { ...where, tripType };
    if (currentDay) {
      where = {
        ...where,
        departureTime: {
          [Op.gte]:
          moment(moment(), 'YYYY-MM-DD').toDate()
        }
      };
    }
    let dateFilters = TripService.getDateFilters('departureTime', departureTime || {});
    where = { ...where, ...dateFilters };
    dateFilters = TripService.getDateFilters('createdAt', requestedOn || {});
    where = { ...where, ...dateFilters };
    return where;
  }

  async getPaginatedTrips(filters, pageNo,
    limit = SlackPagination.getSlackPageSize()) {
    const filter = {
      ...filters,
      include: this.defaultInclude
    };
    const trips = new SequelizePaginationHelper(
      TripRequest, filter, limit
    );
    return trips.getPageItems(pageNo);
  }

  async getTrips(pageable, where) {
    const { page, size } = pageable;
    const filter = this.createFilter(where);
    const paginatedRoutes = new SequelizePaginationHelper(
      TripRequest,
      filter,
      size
    );
    const { data, pageMeta } = await paginatedRoutes.getPageItems(page);
    const trips = data.map(trip => TripService.serializeTripRequest(trip));
    return { trips, ...pageMeta };
  }

  createFilter(where, defaultInclude = this.defaultInclude) {
    const { departmentName: name } = where;
    let include = [...defaultInclude];

    if (name && this.defaultInclude.indexOf('department') > -1) {
      include.splice(include.indexOf('department'), 1);
      const department = {
        model: Department,
        as: 'department',
        where: { name }
      };
      include = [...include, department];
    }
    /* eslint no-param-reassign: ["error", { "props": false }] */
    delete where.departmentName;
    return {
      where,
      include
    };
  }

  static serializeUser(requester) {
    if (requester) {
      const { email, slackId, name: username } = requester;
      const name = Utils.getNameFromEmail(email) || username;
      return {
        name,
        email,
        slackId
      };
    }
  }

  static serializeAddress(address) {
    if (address) {
      return address.address;
    }
  }

  static serializeDepartment(department) {
    if (department) {
      return department.name;
    }
  }

  static serializeFlightNumber(trip) {
    const { tripType } = trip;
    if (tripType === 'Airport Transfer') {
      const { tripDetail } = trip;
      if (!tripDetail) return '-';
      const { flightNumber } = tripDetail;
      return flightNumber || '-';
    }
  }

  static serializeTripRequest(trip) {
    const {
      requester, origin, destination, rider, department, approver, confirmer, decliner, ...tripInfo
    } = trip;
    const {
      id, name, tripStatus: status, departureTime, arrivalTime, createdAt,
      tripType: type, noOfPassenger, rating, managerComment,
      operationsComment, distance
    } = tripInfo;
    return {
      id,
      name,
      status,
      arrivalTime,
      type,
      passenger: noOfPassenger,
      departureTime: moment(departureTime, 'YYYY-MM-DD HH:mm:ss').toISOString(),
      requestedOn: createdAt,
      department: TripService.serializeDepartment(department),
      destination: TripService.serializeAddress(destination),
      pickup: TripService.serializeAddress(origin),
      flightNumber: TripService.serializeFlightNumber(trip),
      decliner: TripService.serializeUser(decliner),
      rider: TripService.serializeUser(rider),
      requester: TripService.serializeUser(requester),
      approvedBy: TripService.serializeUser(approver) || {},
      confirmedBy: TripService.serializeUser(confirmer) || {},
      rating,
      operationsComment,
      managerComment,
      distance
    };
  }

  static getDateFilters(field, data) {
    const { after, before } = data;
    const both = after && before;
    let from;
    let to;
    let condition;
    if (after) {
      from = { [Op.gte]: moment(after, 'YYYY-MM-DD').toDate() };
      condition = from;
    }

    if (before) {
      to = { [Op.lte]: moment(before, 'YYYY-MM-DD').toDate() };
      condition = to;
    }

    if (both) {
      condition = { [Op.and]: [from, to] };
    }

    if (!after && !before) return {};
    return {
      [field]: condition
    };
  }

  static async checkExistence(id) {
    const count = await TripRequest.count({ where: { id } });
    if (count > 0) {
      return true;
    }
    return false;
  }

  async getById(pk, refresh = false) {
    if (!refresh) {
      const cachedTrip = await cache.fetch(getTripKey(pk));
      if (cachedTrip) {
        return cachedTrip;
      }
    }
    try {
      const trip = await TripRequest.findByPk(pk, {
        include: [...this.defaultInclude]
      });
      const data = RemoveDataValues.removeDataValues(trip.dataValues);
      await cache.saveObject(getTripKey(pk), data);
      return data;
    } catch (error) {
      throw new Error('Could not return the requested trip');
    }
  }


  /**
   *this method returns a non-paginated array of trips from the database.
   */
  async getAll(
    params = { where: {} },
    order = { order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']] }
  ) {
    const trips = await TripRequest.findAll(
      {
        where: params.where,
        include: [...this.defaultInclude],
        order: [...order.order]
      }
    );
    return RemoveDataValues.removeDataValues(trips);
  }

  async updateRequest(tripId, updateObject) {
    try {
      await TripRequest.update({ ...updateObject },
        { returning: true, where: { id: tripId } });

      const result = await this.getById(tripId, true);
      await cache.saveObject(getTripKey(tripId), result);
      return result;
    } catch (error) {
      HttpError.throwErrorIfNull(null, 'Error updating trip request', 500);
    }
  }

  static async createRequest(requestObject) {
    const { dataValues: trip } = await TripRequest.create(requestObject);
    return trip;
  }
}

const tripService = new TripService();
export default tripService;
