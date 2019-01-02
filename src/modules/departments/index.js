import express from 'express';
import DepartmentsController from './DepartmentsController';
import middlewares from '../../middlewares';

const departmentRouter = express.Router();

const { DepartmentValidator, UserValidator, GeneralValidator } = middlewares;

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
export default departmentRouter;
