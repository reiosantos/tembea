import Response from '../../helpers/responseHelper';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import { driverService } from '../../services/DriverService';

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
      const data = await driverService.createProviderDriver(body);
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
    await driverService.deleteDriver(driver);
    return Response.sendResponse(res, 200, true, 'Driver successfully deleted');
  }
}
export default DriverController;
