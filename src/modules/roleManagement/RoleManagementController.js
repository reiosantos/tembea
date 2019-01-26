import RoleService from '../../services/RoleService';
import HttpError from '../../helpers/errorHandler';
import Response from '../../helpers/responseHelper';
import bugsnagHelper from '../../helpers/bugsnagHelper';

class RoleManagementController {
  /**
   * @static async newRole
   * @description This method handles the creation of a new Role
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   * @memberof RoleManagementController
   */
  static async newRole(req, res) {
    try {
      const {
        body: { roleName: name }
      } = req;
      const role = await RoleService.createNewRole(name.trim());
      const message = 'Role has been created successfully';
      Response.sendResponse(res, 201, true, message, role);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
  * @static async readRoles
  * @description This method fetches all roles in the db
  * @param  {object} req The http request object
  * @param  {object} res The http response object
  * @returns {object} The http response object
  * @memberof RoleManagementController
  */
  static async readRoles(req, res) {
    try {
      const roles = await RoleService.getRoles();

      const message = 'All available roles';
      Response.sendResponse(res, 200, true, message, roles);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
  * @static async readUserRole
  * @description This method fetches a users role
  * @param  {object} req The http request object
  * @param  {object} res The http response object
  * @returns {object} The http response object
  * @memberof RoleManagementController
  */
  static async readUserRole(req, res) {
    try {
      const {
        query: { email }
      } = req;
      const roles = await RoleService.getUserRoles(email);

      const message = 'User roles';
      Response.sendResponse(res, 200, true, message, roles);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
  * @static async assignRoleToUser
  * @description This method assigns a role to an existing user
  * @param  {object} req The http request object
  * @param  {object} res The http response object
  * @returns {object} The http response object
  * @memberof RoleManagementController
  */
  static async assignRoleToUser(req, res) {
    try {
      const {
        body: { email, roleName }
      } = req;
      await RoleService.createUserRole(email, roleName);

      const message = 'Role was successfully assigned to the user';
      Response.sendResponse(res, 201, true, message, '');
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default RoleManagementController;
