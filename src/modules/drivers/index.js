import express from 'express';
import DriverController from './DriverController';
import middlewares from '../../middlewares';
import DriversValidator from '../../middlewares/DriversValidator';

const {
  TokenValidator, ProviderValidator
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


export default driverRouter;
