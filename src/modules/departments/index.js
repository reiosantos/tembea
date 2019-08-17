import express from 'express';
import DepartmentsController from './DepartmentsController';
import middlewares from '../../middlewares';
import HomeBaseFilterValidator from '../../middlewares/HomeBaseFilterValidator';

const departmentRouter = express.Router();
const {
  DepartmentValidator, TokenValidator, GeneralValidator
} = middlewares;

departmentRouter.use(
  '/departments',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
);

/**
 * @swagger
 * /departments:
 *  put:
 *    summary: update department records
 *    tags:
 *      - Departments
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - name
 *          properties:
 *            name:
 *              type: string
 *            newName:
 *              type: string
 *            newHeadEmail:
 *              type: string
 *            location:
 *              type: string
 *    responses:
 *      200:
 *        description: success response object
 */
departmentRouter.put(
  '/departments',
  DepartmentValidator.validateUpdateBody,
  DepartmentsController.updateDepartment
);

/**
 * @swagger
 * /departments:
 *  post:
 *    summary: add new deparments
 *    tags:
 *      - Departments
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - name
 *            - email
 *            - slackUrl
 *            - location
 *          properties:
 *            name:
 *              type: string
 *            email:
 *              description: department head email address
 *              type: string
 *            slackUrl:
 *              type: string
 *            location:
 *              type: string
 *    responses:
 *      201:
 *        description: department created successfully
 */
departmentRouter.post(
  '/departments',
  DepartmentValidator.validateAddBody,
  DepartmentsController.addDepartment
);

/**
 * @swagger
 * /departments:
 *  get:
 *    summary: get all departments
 *    tags:
 *      - Departments
 *    parameters:
 *      - name: page
 *        in: query
 *        required: false
 *        description: page number
 *        type: number
 *      - name: size
 *        in: query
 *        required: false
 *        description: number of items per page
 *        type: number
 *    responses:
 *      200:
 *        description: success respoonse object containing all found departments
 *      404:
 *        description: no departments found on the database
 */
departmentRouter.get(
  '/departments',
  GeneralValidator.validateQueryParams,
  DepartmentsController.readRecords
);

/**
 * @swagger
 * /departments:
 *  delete:
 *    summary: delete a department
 *    tags:
 *      - Departments
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - id
 *            - name
 *          properties:
 *            id:
 *              type: number
 *            name:
 *              type: string
 *    responses:
 *      200:
 *        description: department deleted successfully
 *      400:
 *        description: one of the required inputs is missing or invalid
 */
departmentRouter.delete(
  '/departments',
  DepartmentValidator.validateDeleteProps,
  DepartmentsController.deleteRecord
);

/**
 * @swagger
 * /departments/trips:
 *  post:
 *    summary: fetch department trips with analytics data
 *    tags:
 *      - Departments
 *      - Trips
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - startDate
 *            - endDate
 *          properties:
 *            startDate:
 *              type: string
 *            endDate:
 *              type: string
 *            departments:
 *              description: array of departments
 *              type: array
 *    responses:
 *      200:
 *        description: department trips fetched successfully
 */
departmentRouter.post(
  '/departments/trips',
  DepartmentValidator.validateDepartmentTrips,
  DepartmentValidator.validateTripType,
  HomeBaseFilterValidator.validateHomeBaseAccess,
  DepartmentsController.fetchDepartmentTrips
);

export default departmentRouter;
