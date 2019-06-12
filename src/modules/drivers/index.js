import express from 'express';
import DriverController from './DriverController';
import middlewares from '../../middlewares';

const {
  TokenValidator, ProviderValidator, DriversValidator, GeneralValidator
} = middlewares;
const driverRouter = express.Router();


driverRouter.use(
  '/providers/drivers',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken
);

/**
 * @swagger
 * /providers/drivers:
 *  post:
 *    summary: creates a new provider driver
 *    tags:
 *      - Provider Drivers
 *    parameters:
 *      - driverName: body
 *      - driverPhoneNo: body
 *      - driverNumber : body
 *      - email: body
 *      - providerId: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - driverName
 *            - driverPhoneNo
 *            - driverNumber
 *            - providerId
 *          properties:
 *            driverName:
 *              type: string
 *            email :
 *              type: string
 *            driverPhoneNo:
 *              type: number
 *            driverNumber:
 *              type: string
 *    responses:
 *      201:
 *        description: driver created successfully
 */
driverRouter.post(
  '/providers/drivers',
  ProviderValidator.validateDriverRequestBody,
  ProviderValidator.validateProviderExistence,
  DriverController.addProviderDriver
);

/**
 * @swagger
 * /providers/{providerId}/drivers/{driverId}:
 *  delete:
 *    summary: delete a specific driver
 *    tags:
 *      - Provider Drivers
 *    parameters:
 *      - name: providerId
 *        in: path
 *        required: true
 *        description: id of the driver's provider
 *        type: number
 *      - name: driverId
 *        in: path
 *        required: true
 *        description: id of the driver to be deleted
 *        type: number
 *    responses:
 *      200:
 *        description: Driver successfully deleted
 *      400:
 *        description: Validation error
 *      404:
 *        description: Driver does not exist
 */
driverRouter.delete(
  '/providers/:providerId/drivers/:driverId',
  DriversValidator.validateProviderDriverIdParams,
  DriversValidator.validateIsProviderDriver,
  DriverController.deleteDriver
);

/**
 * @swagger
 * /providers/:providerId/drivers/:driverId:
 *  put:
 *    summary: updates the driver with the given id
 *    tags:
 *      - Provider Drivers
 *    parameters:
 *      - driverName: body
 *      - driverPhoneNo: body
 *      - driverNumber : body
 *      - email: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          properties:
 *            driverName:
 *              type: string
 *            email :
 *              type: string
 *            driverPhoneNo:
 *              type: number
 *            driverNumber:
 *              type: string
 *    responses:
 *      200:
 *        description: driver successfully updated
 */
driverRouter.put(
  '/providers/:providerId/drivers/:driverId',
  DriversValidator.validateProviderDriverIdParams,
  DriversValidator.validateIsProviderDriver,
  DriversValidator.validateDriverUpdateBody,
  DriversValidator.validatePhoneNoAndNumberAlreadyExists,
  DriverController.update
);

/**
 * @swagger
 * /drivers:
 *  get:
 *    summary: get all drivers
 *    tags:
 *      - Driver
 *    parameters:
 *      - name: providerId
 *        in: query
 *        description: id of the provider to filter Drivers
 *        required: false
 *        type: number
 *      - name: page
 *        in: query
 *        required: false
 *        description: page number (defaults to **1**)
 *        type: number
 *      - name: size
 *        in: query
 *        required: false
 *        description: number of items per page
 *        type: number
 *    responses:
 *      200:
 *        description: response object containing an array of drivers
 *      400:
 *        description: invalid parameters provided in url
 *      401:
 *        description: unauthorized access not allowed
 */
driverRouter.get(
  '/drivers',
  GeneralValidator.validateQueryParams,
  ProviderValidator.validateQueryProvider,
  DriverController.getDrivers
);

export default driverRouter;
