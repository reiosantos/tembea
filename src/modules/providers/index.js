import { Router } from 'express';
import middlewares from '../../middlewares';
import ProvidersController from './ProvidersController';

const {
  TokenValidator, GeneralValidator
} = middlewares;

const providersRouter = Router();

providersRouter.use(
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken
);


/**
 * @swagger
 * /providers:
 *  get:
 *    summary: get all providers
 *    tags:
 *      - Providers
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
 *      - name: name
 *        in: query
 *        required: false
 *        description: search for a specific provider
 *        type: string
 *    responses:
 *      200:
 *        description: response object containing an array of vehicles
 *      400:
 *        description: invalid parameters provided in url
 *      401:
 *        description: unauthorized access not allowed
 */
providersRouter.get(
  '/providers',
  GeneralValidator.validateQueryParams,
  GeneralValidator.validateSearchParams,
  ProvidersController.getAllProviders
);

export default providersRouter;
