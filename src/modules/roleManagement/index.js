import express from 'express';
import RoleManagementController from './RoleManagementController';
import middlewares from '../../middlewares';

const roleManagementRouter = express.Router();
const { TokenValidator, UserValidator } = middlewares;

// assign role to user
roleManagementRouter.post(
  '/roles/user',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  UserValidator.validateEmailOrRoleName,
  TokenValidator.validateRole,
  UserValidator.validateEmail,
  RoleManagementController.assignRoleToUser
);

// get a users role
roleManagementRouter.get(
  '/roles/user',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  TokenValidator.validateRole,
  UserValidator.validateEmailOrRoleName,
  UserValidator.validateEmail,
  RoleManagementController.readUserRole
);

// create a new role
roleManagementRouter.post(
  '/roles',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  TokenValidator.validateRole,
  UserValidator.validateEmailOrRoleName,
  RoleManagementController.newRole
);

// read all roles
roleManagementRouter.get(
  '/roles',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  TokenValidator.validateRole,
  RoleManagementController.readRoles
);

export default roleManagementRouter;
