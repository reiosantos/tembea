import { Router } from 'express';
import middlewares from '../../middlewares';
import CabsController from './CabsController';

const {
  TokenValidator, CabsValidator, GeneralValidator, CleanRequestBody
} = middlewares;

const cabsRouter = Router();

cabsRouter.use(
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken
);

/**
 * @swagger
 * /cabs:
 *  post:
 *    summary: creates a new cab
 *    tags:
 *      - Cabs
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - driverName
 *            - driverPhoneNo
 *            - regNumber
 *            - capacity
 *            - model
 *            - location
 *          properties:
 *            driverName:
 *              type: string
 *            driverPhoneNo:
 *              type: string
 *            regNumber:
 *              type: string
 *            capacity:
 *              type: string
 *            model:
 *              type: string
 *            location:
 *              type: string
 *    responses:
 *      201:
 *        description: cab created successfully
 */

cabsRouter.post(
  '/cabs',
  CleanRequestBody.trimAllInputs,
  CabsValidator.validateAllInputs,
  CabsController.createCab
);

/**
 * @swagger
 * /cabs:
 *  get:
 *    summary: get all cabs
 *    tags:
 *      - Cabs
 *    parameters:
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
 *        description: response object containing an array of cabs
 *      400:
 *        description: invalid parameters provided in url
 *      401:
 *        description: unauthorized access not allowed
 */
cabsRouter.get(
  '/cabs',
  GeneralValidator.validateQueryParams,
  CabsController.getAllCabs
);

export default cabsRouter;
