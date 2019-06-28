import Response, { getPaginationMessage } from '../../helpers/responseHelper';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import { driverService } from '../../services/DriverService';
import ProviderHelper from '../../helpers/providerHelper';
import HttpError from '../../helpers/errorHandler';
import BatchUseRecordService from '../../services/BatchUseRecordService';
import { SlackEvents, slackEventNames } from '../slack/events/slackEvents';

class DriverController {
  /**
   * @description Create a driver in the database
   * @param {object} req
   * @param {object} res
   * @returns {object} Http response object
   */
  static async addProviderDriver(req, res) {
    try {
      const { body } = req;
      const data = await driverService.create(body);
      if (data.errors) {
        return Response.sendResponse(res, 400, false,
          data.errors[0].message);
      }
      const { _options: { isNewRecord }, dataValues } = data;
      if (isNewRecord) {
        return Response.sendResponse(res, 201, true,
          'Driver added successfully', dataValues);
      }
      return Response.sendResponse(res, 409, false,
        `Driver with  driver Number ${body.driverNumber} already exists`);
    } catch (error) {
      bugsnagHelper.log(error);
      return Response.sendResponse(res, 500, false,
        'An error occurred in the creation of the driver');
    }
  }

  /**
   * Performs the operation of removing a specified driver
   *
   * @static
   * @param {object} req - Express Request object
   * @param {object} res - Express Response object
   * @returns {object} Returns the evaluated response
   * @memberof DriverController
   */
  static async deleteDriver(req, res) {
    const { locals: { driver } } = res;
    const routes = await BatchUseRecordService.findActiveRouteWithDriver(driver.id);
    await driverService.deleteDriver(driver);
    if (routes[0]) await SlackEvents.raise(slackEventNames.UPDATE_ROUTE_DRIVER, driver, routes);
    return Response.sendResponse(res, 200, true, 'Driver successfully deleted');
  }

  static async update(req, res) {
    try {
      const { params: { driverId }, body } = req;
      const driver = await driverService.update(driverId, body);
      if (driver.message) {
        return Response.sendResponse(res, 404, false,
          driver.message);
      }
      return Response.sendResponse(res, 200, true,
        'Driver updated successfully', driver);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description Gets drivers in the database
   * @param {object} req
   * @param {object} res
   * @returns {object} Http response object
   */
  static async getDrivers(req, res) {
    try {
      const { query } = req;
      const payload = ProviderHelper.getProviderDetailsFromReq(query);
      const { pageable, where } = payload;

      const result = await driverService.getPaginatedItems(pageable, where);
      const message = getPaginationMessage(result.pageMeta);

      return Response.sendResponse(res, 200, true, message, result);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }
}
export default DriverController;
