import express from 'express';
import ProviderController from './ProviderController';
import middlewares from '../../middlewares';

const {
  TokenValidator, GeneralValidator, ProviderValidator, CabsValidator
} = middlewares;
const providerRouter = express.Router();


providerRouter.use(
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
providerRouter.get(
  '/providers',
  GeneralValidator.validateQueryParams,
  GeneralValidator.validateSearchParams,
  ProviderController.getAllProviders
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
providerRouter.patch(
  '/providers/:id',
  ProviderValidator.validateReqBody,
  ProviderValidator.verifyProviderUpdateBody,
  ProviderController.updateProvider
);

/**
 * @swagger
 * /providers/{id}:
 *  delete:
 *    summary: delete a specific provider
 *    tags:
 *      - Providers
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: id of provider to be deleted
 *        type: number
 *    responses:
 *      200:
 *        description: Provider successfully deleted
 *      404:
 *        description: Provider does not exist
 */
providerRouter.delete(
  '/providers/:id',
  CabsValidator.validateDeleteCabIdParam,
  ProviderController.deleteProvider
);

/**
 * /providers:
 *  post:
 *    summary: creates a new provider
 *    tags:
 *      - Providers
 *    parameters:
 *      - name: body
 *      - email: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - name
 *            - email
 *          properties:
 *            name:
 *              type: string
 *            email :
 *              type: string
 *    responses:
 *      201:
 *        description: provider created successfully
 */
providerRouter.post(
  '/providers',
  ProviderValidator.validateReqBody,
  ProviderValidator.validateUserExistence,
  ProviderController.addProvider
);

export default providerRouter;
