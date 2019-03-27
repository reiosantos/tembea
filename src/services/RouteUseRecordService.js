import moment from 'moment';
import { MAX_INT as all } from '../helpers/constants';
import models from '../database/models';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import RemoveDataValues from '../helpers/removeDataValues';
import BatchUseRecordService from './BatchUseRecordService';
import RouteService from './RouteService';


const { RouteUseRecord } = models;

class RouteUseRecordService {
  static get defaultPageable() {
    return {
      page: 1, size: all
    };
  }

  static async createRouteUseRecord(batchId) {
    const date = moment(new Date()).format('YYYY-MM-DD');
    const route = await RouteService.getRoute(batchId);
    const riders = RemoveDataValues.removeDataValues(RemoveDataValues.removeDataValues(route).riders);
    const { data } = await RouteUseRecordService.getRouteUseRecords(undefined, { batchUseDate: date, batchId });

    if (data.length) {
      await BatchUseRecordService.createBatchUseRecord(data[0], riders);
      await RouteUseRecordService.updateUsageStatistics(data[0].id);
      return data[0];
    }
    const result = await RouteUseRecord.create({
      batchId,
      batchUseDate: date,
    });
    const routeUseRecord = RemoveDataValues.removeDataValues(result);
    await BatchUseRecordService.createBatchUseRecord(routeUseRecord, riders);
    await RouteUseRecordService.updateUsageStatistics(routeUseRecord.id);

    return routeUseRecord;
  }


  static async getRouteUseRecords(pageable = RouteUseRecordService.defaultPageable, where = null) {
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
}

export default RouteUseRecordService;
