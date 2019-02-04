import HttpError from '../../helpers/errorHandler';
import DepartmentService from '../../services/DepartmentService';
import UserService from '../../services/UserService';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import TeamDetailsService from '../../services/TeamDetailsService';


class DepartmentController {
  /**
   * @description Get the department by name from the database
   * @param {object} req
   * @param {object} res
   * @returns {object} The http response object
   */

  static async updateDepartment(req, res) {
    const { name, newName, newHeadEmail } = req.body;
    try {
      const department = await DepartmentService.updateDepartment(
        name ? name.trim() : name,
        newName ? newName.trim() : newName,
        newHeadEmail ? newHeadEmail.trim() : newHeadEmail
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
    const { name, email, slackUrl } = req.body;
    try {
      const user = await UserService.getUser(email);
      const { teamId } = await TeamDetailsService.getTeamDetailsByTeamUrl(slackUrl);
      const [dept, created] = await DepartmentService.createDepartment(user, name, teamId);

      if (created) {
        return res
          .status(201)
          .json({
            success: true,
            message: 'Department created successfully',
            department: dept.dataValues
          });
      }
      return res
        .status(409)
        .json({
          success: false,
          message: 'Department already exists.',
        });
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
      const page = req.query.page || 1;
      const size = req.query.size || defaultSize;

      const data = await DepartmentService.getAllDepartments(size, page);
      const { count, rows } = data;
      if (rows <= 0) {
        throw new HttpError('There are no records on this page.', 404);
      }

      const totalPages = Math.ceil(count / size);

      return res.status(200).json({
        success: true,
        message: `${page} of ${totalPages} page(s).`,
        pageMeta: {
          totalPages,
          totalResults: count,
          page,
        },
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
      const { id, name } = req.body;
      const success = await DepartmentService.deleteDepartmentByNameOrId(id, name);

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
}

export default DepartmentController;
