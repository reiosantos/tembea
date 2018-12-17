import HttpError from '../../helpers/errorHandler';
import DepartmentService from '../../services/DepartmentService';


class DepartmentController {
  /**
   * @description Get the department by name from the database
   * @param  {string} name The name of the department on the db
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
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default DepartmentController;
