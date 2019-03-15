import { Router } from 'express';
import middlewares from '../../middlewares';
import CabsController from './CabsController';


const { TokenValidator, CabsValidator } = middlewares;

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
  CabsValidator.validateAllInputs,
  CabsController.createCab
);

export default cabsRouter;
