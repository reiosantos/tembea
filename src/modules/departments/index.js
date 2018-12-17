import express from 'express';
import DepartmentsController from './DepartmentsController';
import middlewares from '../../middlewares';

const departmentRouter = express.Router();

const { DepartmentValidator } = middlewares;

departmentRouter.put(
  '/departments',
  DepartmentValidator.validateEmptyRequestBodyProps,
  DepartmentValidator.validateUpdateBody,
  DepartmentValidator.validateNewHeadEmail,
  DepartmentsController.updateDepartment
);

export default departmentRouter;
