import moment from 'moment';
import { MAX_INT as all } from '../helpers/constants';
import database from '../database';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import RemoveDataValues from '../helpers/removeDataValues';
import BatchUseRecordService from './BatchUseRecordService';
import { homebaseInfo } from './RouteService';

const {
  models: {
    RouteUseRecord, RouteBatch, Cab, Route, Driver, Address
  }
} = database;

const routeRecordInclude = {
  include: [{
    model: RouteBatch,
    as: 'batch',
    paranoid: false,
    where: {},
    include: [
      'riders',
      {
        model: Route,
        as: 'route',
        attributes: ['name', 'imageUrl'],
        include: [
          { model: Address, as: 'destination', attributes: ['address'] },
          { ...homebaseInfo }
        ]
      },
      {
        model: Cab,
        as: 'cabDetails',
        attributes: ['regNumber', 'model']
      },
      {
        model: Driver,
        as: 'driver',
        attributes: ['driverName', 'driverPhoneNo', 'driverNumber', 'email']
      },
      // { model: BatchUseRecord, attributes: ['rating'] }
    ],
  }]
};

class RouteUseRecordService {
  static get defaultPageable() {
    return {
      page: 1, size: all
    };
  }

  static async getByPk(id, withFks = false) {
    const filter = {
      include: withFks
        ? [{
          model: RouteBatch,
          as: 'batch',
          include: ['riders', 'route']
        }] : null
    };
    const record = await RouteUseRecord.findByPk(id, filter);
    return RemoveDataValues.removeDataValues(record);
  }

  static async create(batchId) {
    const date = moment.utc().toISOString();
    const result = await RouteUseRecord.create({
      batchId,
      batchUseDate: date,
    });
    return result.dataValues;
  }

  static async getAll(pageable = RouteUseRecordService.defaultPageable, where = null) {
    const { page, size } = pageable;
    let order;
    let filter;
    if (where) {
      filter = { where: { ...where } };
    }
    const paginatedRoutes = new SequelizePaginationHelper(RouteUseRecord, filter, size);
    paginatedRoutes.filter = {
      ...filter, subQuery: false, order, include: ['batch']
    };
    const { data, pageMeta } = await paginatedRoutes.getPageItems(page);
    return {
      data, ...pageMeta
    };
  }


  static async updateUsageStatistics(batchRecordId) {
    const { data } = await BatchUseRecordService.getBatchUseRecord(undefined, { batchRecordId });
    let confirmedUsers = 0;
    let unConfirmedUsers = 0;
    let skippedUsers = 0;
    let pendingUsers = 0;
    data.map(async (userRecord) => {
      if (userRecord.userAttendStatus === 'Confirmed') {
        confirmedUsers += 1;
      }
      if (userRecord.userAttendStatus === 'Skip') {
        skippedUsers += 1;
      }
      if (userRecord.userAttendStatus === 'NotConfirmed') {
        unConfirmedUsers += 1;
      }
      if (userRecord.userAttendStatus === 'Pending') {
        pendingUsers += 1;
      }
      return '';
    });

    await RouteUseRecordService.updateRouteUseRecord(batchRecordId,
      {
        unConfirmedUsers, confirmedUsers, skippedUsers, pendingUsers
      });
  }

  static async updateRouteUseRecord(recordId, updateObject) {
    const result = await RouteUseRecord.update({ ...updateObject },
      {
        returning: true,
        where: { id: recordId }
      });
    return result;
  }

  static async getRouteTripRecords(pageable, homebaseId) {
    const { page, size } = pageable;
    const paginationConstraint = {
      offset: (page - 1) * size,
      limit: size
    };
    if (homebaseId) routeRecordInclude.include[0].where.homebaseId = homebaseId;
    const allRouteRecords = await RouteUseRecord.findAll({
      ...routeRecordInclude
    });

    const paginatedRouteRecords = await RouteUseRecord.findAll({
      ...paginationConstraint,
      ...routeRecordInclude
    });

    const paginationMeta = {
      totalPages: Math.ceil(allRouteRecords.length / size),
      pageNo: page,
      totalItems: allRouteRecords.length,
      itemsPerPage: size
    };
    return {
      data: RemoveDataValues.removeDataValues(paginatedRouteRecords),
      pageMeta: { ...paginationMeta }
    };
  }

  static getAdditionalInfo(routeTripsData) {
    return routeTripsData.map((record) => {
      const recordInfo = { ...record.dataValues };
      const {
        confirmedUsers,
        unConfirmedUsers,
        skippedUsers,
        pendingUsers
      } = record;
      const totalUsers = confirmedUsers + unConfirmedUsers + skippedUsers + pendingUsers;
      const utilization = ((confirmedUsers / totalUsers) * 100).toFixed(0);
      recordInfo.utilization = utilization >= 0 ? utilization : '0';
      const ratingsArray = RemoveDataValues.removeDataValues(record.batch.BatchUseRecords);
      const sumOfRatings = ratingsArray.reduce((prev, next) => prev + next.rating, 0);
      const averageRating = (sumOfRatings / ratingsArray.length).toFixed(2);
      recordInfo.averageRating = averageRating > 0 ? averageRating : 0.00;
      delete recordInfo.batch.BatchUseRecords;
      return recordInfo;
    });
  }
}

export default RouteUseRecordService;
