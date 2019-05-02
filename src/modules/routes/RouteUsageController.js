import groupArray from 'group-array';
import BatchUseRecordService from '../../services/BatchUseRecordService';
import RouteHelper from '../../helpers/RouteHelper';
import HttpError from '../../helpers/errorHandler';
import BugSnagHelper from '../../helpers/bugsnagHelper';
import Response from '../../helpers/responseHelper';


class RoutesUsageController {
  /**
       * @description Read the routes batch records
       * @param  {object} req The http request object
       * @param  {object} res The http response object
       * @returns {object} The http response object
       */
  static async getRouteUsage(req, res) {
    try {
      const { from, to } = req.query;

      const batchUsageRecords = await BatchUseRecordService.getRoutesUsage(from, to);
      const groupedData = groupArray(batchUsageRecords[0], 'Route', 'RouteBatchName');
      const filteredUsageData = Object.values(groupedData);
      const allUsageRecords = [];
      const dormantRouteBatches = [];
      filteredUsageData.forEach((route) => {
        const routeBatch = Object.values(route);
        routeBatch.map(record => RouteHelper.findPercentageUsage(record, allUsageRecords, dormantRouteBatches));
      });
      const mostUsedBatch = RouteHelper.findMaxOrMin(allUsageRecords, 'max');
      const leastUsedBatch = RouteHelper.findMaxOrMin(allUsageRecords, 'min');
      return Response.sendResponse(res, 200, true, 'Percentage Usage Generated',
        { mostUsedBatch, leastUsedBatch, dormantRouteBatches });
    } catch (error) {
      BugSnagHelper.log(error);
      return HttpError.sendErrorResponse(error, res);
    }
  }
}
export default RoutesUsageController;
