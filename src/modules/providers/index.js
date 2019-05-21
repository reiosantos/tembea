import { Router } from 'express';
import middlewares from '../../middlewares';
import ProvidersController from './ProvidersController';

const {
  TokenValidator, GeneralValidator, ProviderValidator, CleanRequestBody
} = middlewares;

const providersRouter = Router();


providersRouter.use(
  '/providers',
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
/**
 * @swagger
 * /provider/{id}:
 *  put:
 *    summary: update provider details
 *    tags:
 *      - Providers
 *    parameters:
 *      - in : path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: ID of the provider to update
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            email:
 *              type: string
 *    responses:
 *      200:
 *        description: details of provider  are returned and a success message
 *      404:
 *        provider doesnt exist ||  user doesnt exist
 *      400:
 *        Validation Errors
 */
providersRouter.patch(
  '/providers/:id',
  CleanRequestBody.trimAllInputs,
  ProviderValidator.verifyProviderUpdateBody,
  ProvidersController.updateProvider
);

export default providersRouter;
