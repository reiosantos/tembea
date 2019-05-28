import express from 'express';
import DriverController from './DriverController';
import middlewares from '../../middlewares';

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


export default driverRouter;
