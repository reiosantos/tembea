import express from 'express';
import DepartmentsController from './DepartmentsController';
import middlewares from '../../middlewares';

const departmentRouter = express.Router();

const {
  DepartmentValidator, UserValidator, GeneralValidator, TokenValidator
} = middlewares;

departmentRouter.use(
  '/departments',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken
);

departmentRouter.put(
  '/departments',
  DepartmentValidator.validateEmptyRequestBodyProps,
  DepartmentValidator.validateUpdateBody,
  DepartmentValidator.validateNewHeadEmail,
  DepartmentsController.updateDepartment
);

departmentRouter.post(
  '/departments',
  DepartmentValidator.validateAddBody,
  UserValidator.validateEmail,
  DepartmentValidator.validateDepartmentBody,
  DepartmentsController.addDepartment
);

departmentRouter.get(
  '/departments',
  GeneralValidator.validateQueryParams,
  DepartmentsController.readRecords
);

departmentRouter.delete(
  '/departments',
  DepartmentValidator.validateDeleteProps,
  DepartmentValidator.validateDeletePropsValues,
  DepartmentsController.deleteRecord
);

export default departmentRouter;
