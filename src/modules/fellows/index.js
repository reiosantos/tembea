import { Router } from 'express';
import middlewares from '../../middlewares';
import FellowController from './FellowsController';


const { TokenValidator, GeneralValidator } = middlewares;

const fellowsRouter = Router();

fellowsRouter.use('/engineerActivity',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken);

fellowsRouter.use('/engineers',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken);

/**
 * @swagger
 * /fellowsActivity:
 *  get:
 *    summary: fetch a fellow's route activity
 *    tags:
 *      - Fellow's Route Activity
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
 *      - name: id
 *        in: query
 *        required: true
 *        description: user id of a fellow
 *        type: number
 *    responses:
 *      200:
 *        description: response object containing all the details of a fellow's route movement
 */

fellowsRouter.get(
  '/engineerActivity',
  GeneralValidator.validateQueryParams,
  FellowController.getFellowRouteActivity
);

/**
 * @swagger
 * /fellows:
 *  get:
 *    summary: fetch all fellows on routes
 *    tags:
 *      - Fellow on Routes
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
 *        description: an array of data objects containing details of fellows on routes
 */
fellowsRouter.get(
  '/engineers',
  GeneralValidator.validateQueryParams,
  FellowController.getAllFellows
);

export default fellowsRouter;
