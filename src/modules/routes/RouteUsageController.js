import groupArray from 'group-array';
import BatchUseRecordService from '../../services/BatchUseRecordService';
import RouteHelper from '../../helpers/RouteHelper';
import HttpError from '../../helpers/errorHandler';
import BugSnagHelper from '../../helpers/bugsnagHelper';
import Response from '../../helpers/responseHelper';
import RouteService from '../../services/RouteService';


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
        routeBatch.map((record) => RouteHelper.findPercentageUsage(record, allUsageRecords, dormantRouteBatches));
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

  static async getRouteRatings(req, res) {
    try {
      const { from, to } = req.query;
      const { homebaseid } = req.headers;
      const data = await RouteService.RouteRatings(from, to, homebaseid);
      const groupedData = groupArray(data[0], 'Route', 'RouteBatchName');
      const routeAverageRatings = [];
      Object.values(groupedData).forEach((route) => {
        Object.values(route).map((batchRatings) => {
          const sum = batchRatings.reduce((prev, next) => prev + next.rating, 0);
          const avg = sum / batchRatings.length;
          const { RouteBatchName, Route } = batchRatings[0];
          const ratings = {
            RouteBatchName, Route, NumberOfRatings: batchRatings.length, Average: Math.round(avg)
          };
          return routeAverageRatings.push(ratings);
        });
      });
      return Response.sendResponse(res, 200, true, 'Ratings Fetched Successfully',
        routeAverageRatings.sort((a, b) => b.Average - a.Average));
    } catch (error) {
      BugSnagHelper.log(error);
      return HttpError.sendErrorResponse(error, res);
    }
  }
}
export default RoutesUsageController;
