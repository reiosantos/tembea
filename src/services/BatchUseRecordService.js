import { MAX_INT as all } from '../helpers/constants';
import models from '../database/models';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import RemoveDataValues from '../helpers/removeDataValues';

const {
  BatchUseRecord, RouteUseRecord, RouteBatch, Route, sequelize
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
    users.map(async (user) => {
      const { data: existingUser } = await BatchUseRecordService.getBatchUseRecord(
        undefined,
        { userId: user.id, batchRecordId: batchRecord.id }
      );
      if (existingUser.length > 0) {
        return;
      }
      const result = await BatchUseRecord.create({
        userId: user.id,
        batchRecordId: batchRecord.id,
      });
      return RemoveDataValues.removeDataValues(result);
    });

    return true;
  }

  static async getBatchUseRecord(pageable = BatchUseRecordService.defaultPageable, where = null) {
    const { page, size } = pageable;
    let order;
    let filter;
    if (where) { filter = { where: { ...where } }; }
    const paginatedRoutes = new SequelizePaginationHelper(BatchUseRecord, filter, size);
    paginatedRoutes.filter = {
      ...filter,
      subQuery: false,
      order,
      include: ['user',
        {
          model: RouteUseRecord,
          as: 'batchRecord',
          include: [{
            model: RouteBatch,
            as: 'batch',
            include: ['cabDetails', {
              model: Route, as: 'route', include: ['destination']
            }]
          }]
        }]
    };
    const pagenatedData = await paginatedRoutes.getPageItems(page);
    const { data, pageMeta } = pagenatedData;
    const newData = data.map(BatchUseRecordService.serializeBatchRecord);
    pagenatedData.data = newData;
    pagenatedData.pageMeta = pageMeta;
    return pagenatedData;
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
}

export default BatchUseRecordService;
