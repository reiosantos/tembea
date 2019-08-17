import { MAX_INT as all } from '../helpers/constants';
import models from '../database/models';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import RemoveDataValues from '../helpers/removeDataValues';
import bugsnagHelper from '../helpers/bugsnagHelper';

const {
  BatchUseRecord, RouteUseRecord, RouteBatch, Route, sequelize, Address, User
} = models;

class BatchUseRecordService {
  static async getRoutesUsage(from, to) {
    let query = `SELECT BUR.id AS "BatchUseRecordID", BUR."userAttendStatus", RUR.id AS "RouteRecordID", RB.id As "RouteBatchID",

    RB.batch As "RouteBatchName", R.name As "Route", R.id As "RouteID", RUR."batchUseDate"

    FROM "BatchUseRecords" AS BUR

    INNER JOIN "RouteUseRecords" AS RUR ON BUR."batchRecordId" = RUR.id

    INNER JOIN "RouteBatches" AS RB ON RUR."batchId" = RB.id

    INNER JOIN "Routes" AS R ON RB."routeId" = R.id `;

    const filterByDate = `WHERE RUR."batchUseDate" >= '${from}' AND RUR."batchUseDate" <= '${to}'`;
    if (from && to) {
      query += filterByDate;
    }
    const results = await sequelize.query(query);
    return results;
  }


  static get defaultPageable() {
    return {
      page: 1, size: all, sort: SequelizePaginationHelper.deserializeSort('id,asc')
    };
  }

  static async createBatchUseRecord(batchRecord, users) {
    try {
      const [result] = await Promise.all(users.map(async (user) => {
        const { data: existingUser } = await BatchUseRecordService.getBatchUseRecord(
          undefined,
          { userId: user.id, batchRecordId: batchRecord.id }
        );
        if (existingUser.length > 0) {
          return true;
        }
        const batchUseRecord = await BatchUseRecord.create({
          userId: user.id,
          batchRecordId: batchRecord.id,
        });
        return RemoveDataValues.removeDataValues(batchUseRecord);
      }));
      return result;
    } catch (e) {
      bugsnagHelper.log(e);
    }
  }


  static async getBatchUseRecord(pageable = BatchUseRecordService.defaultPageable, where = null) {
    const { page, size } = pageable;
    let order;
    let filter;
    const criteria = Object.assign({}, where);
    delete criteria.homebaseId;
    if (where) { filter = { where: { ...criteria } }; }
    const paginatedRoutes = new SequelizePaginationHelper(BatchUseRecord, filter, size);
    paginatedRoutes.filter = {
      ...filter,
      subQuery: false,
      order,
      include: [
        {
          model: User,
          as: 'user',
          where: { homebaseId: where.homebaseId }
        },
        {
          model: RouteUseRecord,
          as: 'batchRecord',
          include: [{
            model: RouteBatch,
            as: 'batch',
            include: ['cabDetails', {
              model: Route, as: 'route', include: ['destination']
            }],
          }]
        }]
    };
    const paginatedData = await paginatedRoutes.getPageItems(page);
    const data = BatchUseRecordService.serializePaginatedData(paginatedData);
    return data;
  }

  static async getUserRouteRecord(id) {
    const totalTrips = await BatchUseRecord.count({
      where: {
        userId: id
      }
    });
    const tripsTaken = await BatchUseRecord.count({
      where: {
        userId: id, userAttendStatus: 'Confirmed'
      }
    });
    return { userId: id, totalTrips, tripsTaken };
  }

  static async updateBatchUseRecord(recordId, updateObject) {
    const result = await BatchUseRecord.update({ ...updateObject },
      { returning: true, where: { id: recordId } });
    return result;
  }

  static serializeUser(user) {
    if (!user) return {};
    const {
      id, name, slackId, email, routeBatchId
    } = user;
    return {
      id, name, slackId, email, routeBatchId
    };
  }


  static serializeRouteBatch(batchRecord) {
    if (!batchRecord) return {};
    const {
      id, batchUseDate, batch: {
        id: batchId, takeOff, status, comments, routeId, cabId, cabDetails: {
          driverName, driverPhoneNo, regNumber
        },
        route: {
          name, destination: { locationId, address }
        }
      }
    } = batchRecord;
    return {
      id,
      departureDate: `${batchUseDate} ${takeOff}`,
      routeId,
      batch: {
        batchId, takeOff, status, comments
      },
      cabDetails: {
        cabId, driverName, driverPhoneNo, regNumber
      },
      route: {
        routeId, name, destination: { locationId, address }
      }
    };
  }

  static serializeBatchRecord(batchData) {
    const {
      id, userId, batchRecordId, userAttendStatus, reasonForSkip, rating, createdAt, updatedAt
    } = batchData;
    return {
      id,
      userId,
      batchRecordId,
      userAttendStatus,
      reasonForSkip,
      rating,
      createdAt,
      updatedAt,
      user: { ...BatchUseRecordService.serializeUser(batchData.user) },
      routeUseRecord: { ...BatchUseRecordService.serializeRouteBatch(batchData.batchRecord) },
    };
  }


  static async findActiveRouteWithDriverOrCabId(driverIdOrCabId) {
    const id = { status: 'Active', ...driverIdOrCabId };
    const result = await RouteBatch.findAll({
      where: id,
      include: [
        {
          model: Route,
          as: 'route',
          include: [{
            model: Address,
            as: 'destination'
          }]
        },
      ]
    });
    return result ? RemoveDataValues.removeDataValues(result) : result;
  }

  static serializePaginatedData(paginatedData) {
    const newData = Object.assign({}, paginatedData);
    const { data, pageMeta } = newData;
    const result = data.map(BatchUseRecordService.serializeBatchRecord);
    newData.data = result;
    newData.pageMeta = pageMeta;
    return newData;
  }
}

export default BatchUseRecordService;
