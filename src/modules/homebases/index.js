import express from 'express';
import HomebaseController from './HomebaseController';
import middlewares from '../../middlewares';

const {
  TokenValidator, GeneralValidator, HomebaseValidator
} = middlewares;
const homebaseRouter = express.Router();

homebaseRouter.use(
  '/homebases',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken
);

/**
 * @swagger
 * /homebases:
 *  post:
 *    summary: creates a new homebase
 *    tags:
 *      - Homebases
 *    parameters:
 *      - homebaseName: body
 *      - countryName: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - homebaseName
 *            - countryName
 *          properties:
 *            homebaseName:
 *              type: string
 *            countryName :
 *              type: string
 *    responses:
 *      201:
 *        description: homebase created successfully
 */
homebaseRouter.post(
  '/homebases',
  HomebaseValidator.validateNames,
  HomebaseValidator.validateCountryExists,
  HomebaseController.addHomeBase
);

/**
 * @swagger
 * /homebases:
 *  get:
 *    summary: get all homebases
 *    tags:
 *      - Homebases
 *    parameters:
 *      - name: page
 *        in: query
 *        required: false
 *        description: page number
 *        type: number
 *      - name: size
 *        in: query
 *        required: false
 *        description: number of items per page
 *        type: number
 *    responses:
 *      200:
 *        description: success response object containing all found homebases
 *      404:
 *        description: no homebases found on the database
 */
homebaseRouter.get(
  '/homebases',
  GeneralValidator.validateQueryParams,
  HomebaseValidator.validatePassedQueryParams,
  HomebaseController.getHomebases
);


export default homebaseRouter;
