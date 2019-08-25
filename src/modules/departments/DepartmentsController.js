import HttpError from '../../helpers/errorHandler';
import DepartmentService from '../../services/DepartmentService';
import UserService from '../../services/UserService';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import TeamDetailsService from '../../services/TeamDetailsService';
import Response from '../../helpers/responseHelper';
import TripHelper from '../../helpers/TripHelper';
import HomebaseService from '../../services/HomebaseService';

class DepartmentController {
  /**
   * @description Get the department by name from the database
   * @param {object} req
   * @param {object} res
   * @returns {object} The http response object
   */
  static async isValidDepartmentHomeBase(homeBaseId) {
    const homeBase = await HomebaseService.getById(homeBaseId);
    if (homeBase) {
      const { name: location } = homeBase;
      return location;
    }
    return false;
  }

  static async updateDepartment(req, res) {
    const {
      body: { name, homebaseId, headId },
      params: { id }
    } = req;

    let location;
    await DepartmentController.validateHeadExistence(req, res);
    await DepartmentController.validateLocationExistence(req, res);
    try {
      const department = await DepartmentService.updateDepartment(
        id, name, homebaseId, headId, location
      );
      return res
        .status(200)
        .json({
          success: true,
          message: 'Department record updated',
          department
        });
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async addDepartment(req, res) {
    const {
      body: {
        name, email, slackUrl, homebaseId
      }
    } = req;
    try {
      await DepartmentController.validateLocationExistence(req, res);
      const [user, { teamId }, homeBase] = await Promise.all(
        [UserService.getUser(email), TeamDetailsService.getTeamDetailsByTeamUrl(slackUrl),
          HomebaseService.getById(homebaseId)]
      );

      const { name: location } = homeBase;
      const [dept, created] = await DepartmentService.createDepartment(user,
        name, teamId, location, homebaseId);

      return DepartmentController.returnCreateDepartmentResponse(res, created, dept);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description Read the department records
   * @param {object} req The http request object
   * @param {object} res The http response object
   * @returns {object} The http response object
   */
  static async readRecords(req, res) {
    try {
      const { headers: { homebaseid } } = req;
      const page = req.query.page || 1;
      const size = req.query.size || defaultSize;
      const data = await DepartmentService.getAllDepartments(size,
        page, homebaseid);
      const { count, rows } = data;
      if (rows <= 0) {
        throw new HttpError('There are no records on this page.', 404);
      }
      const totalPages = Math.ceil(count / size);
      return res.status(200).json({
        success: true,
        message: `${page} of ${totalPages} page(s).`,
        pageMeta: { totalPages, totalResults: count, page },
        departments: rows,
      });
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description This method handles the deleting of a department
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async deleteRecord(req, res) {
    try {
      const { body: { id: departmentId, name: departmentName } } = req;
      const success = await DepartmentService.deleteDepartmentByNameOrId(departmentId, departmentName);

      if (success) {
        return res.status(200).json({
          success,
          message: 'The department has been deleted'
        });
      }
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description Get department trips from database
   * @param {object} req
   * @param {object} res
   * @returns {object} The http response object
   */
  static async fetchDepartmentTrips(req, res) {
    try {
      const {
        query: { tripType }, body: { startDate, endDate, departments },
        headers: { homebaseid }
      } = req;
      const analyticsData = await DepartmentService.getDepartmentAnalytics(
        startDate, endDate, departments, tripType, homebaseid
      );
      const deptData = [];
      const { finalCost, finalAverageRating, count } = await
      TripHelper.calculateSums(analyticsData);
      analyticsData.map((departmentTrip) => {
        const deptObject = departmentTrip;
        deptObject.averageRating = parseFloat(departmentTrip.averageRating).toFixed(2);
        return deptData.push(deptObject);
      });
      const data = {
        trips: analyticsData, finalCost, finalAverageRating, count
      };
      return Response.sendResponse(res, 200, true, 'Request was successful', data);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  static async validateHeadExistence(req, res) {
    const { body: { headId } } = req;
    if (headId) {
      const userExists = await UserService.getUserById(headId);
      if (!userExists) {
        return res.status(404)
          .json({
            success: false,
            message: `Department Head with headId ${headId} does not exists`,
          });
      }
    }
  }

  static async validateLocationExistence(req, res) {
    const { body: { homebaseId } } = req;
    if (homebaseId) {
      const location = await DepartmentController.isValidDepartmentHomeBase(homebaseId);
      if (!location) {
        return res.status(400)
          .json({
            success: false,
            message: 'No HomeBase exists with provided homebaseId',
          });
      }
    }
  }

  static returnCreateDepartmentResponse(res, created, dept) {
    if (created) {
      return res.status(201)
        .json({
          success: true,
          message: 'Department created successfully',
          department: dept.dataValues
        });
    }
    return res.status(409)
      .json({
        success: false,
        message: 'Department already exists.',
      });
  }
}

export default DepartmentController;
