import express from 'express';
import TokenValidator from '../../middlewares/TokenValidator';
import middlewares from '../../middlewares';
import RoutesController from './RouteController';

const {
  GeneralValidator
} = middlewares;
const routesV2Router = express.Router();

routesV2Router.use(
  '/routes',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
);

/**
 * @swagger
 * /routes:
 *  get:
 *    summary: Gets all available route batches from the database
 *    tags:
 *      - Routes
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
 *      - name: sort
 *        in: query
 *        required: false
 *        description: sorting order of response (**_name,asc,id,asc_** or **_name,desc,id,asc_** or simply **_name,asc_** or **_name,desc_** or **_name,asc_**. The world is your oyster)
 *        type: string
 *    responses:
 *      200:
 *        description: returns response object containing all available route batches
 */
routesV2Router.get(
  '/routes',
  GeneralValidator.validateQueryParams,
  RoutesController.getRoutes
);

export default routesV2Router;
