import models from '../database/models';
import HttpError from '../helpers/errorHandler';
import UserService from './UserService';

const { Role } = models;

class RoleService {
  static async createNewRole(name) {
    const [role, created] = await Role.findOrCreate({ where: { name } });
    if (created) {
      return role;
    }

    HttpError.throwErrorIfNull(false, 'Role already exists', 409);
  }

  static async getRoles() {
    const roles = await Role.all();
    HttpError.throwErrorIfNull(roles, 'No Existing Roles');

    return roles;
  }

  static async getUserRoles(email) {
    const user = await UserService.getUser(email);
    const roles = await user.getRoles();

    HttpError.throwErrorIfNull(roles[0], 'User has no role');

    return roles;
  }

  static async getRole(name) {
    const role = await Role.find({ where: { name } });
    HttpError.throwErrorIfNull(role, 'Role not found');

    return role;
  }

  static async createUserRole(email, roleName) {
    const [user, role] = await Promise.all([
      UserService.getUser(email),
      RoleService.getRole(roleName)
    ]);
    const userRole = await user.addRoles(role);

    HttpError.throwErrorIfNull(userRole[0], 'This Role is already assigned to this user', 409);

    return userRole;
  }
}

export default RoleService;
