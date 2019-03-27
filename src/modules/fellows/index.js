import { Router } from 'express';
import middlewares from '../../middlewares';
import FellowsController from './FellowsController';

const { TokenValidator, GeneralValidator } = middlewares;

const fellowsRouter = Router();

fellowsRouter.use('/fellowActivity',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken);

/**
 * @swagger
 * /trips:
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
  '/fellowActivity',
  GeneralValidator.validateQueryParams,
  GeneralValidator.validateFellowId,
  FellowsController.getFellowRouteActivity
);

export default fellowsRouter;
