import express from 'express';
import HomebaseController from './HomebaseController';
import middlewares from '../../middlewares';

const {
  TokenValidator, HomebaseValidator, GeneralValidator
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
 *      - countryId: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - homebaseName
 *            - countryId
 *          properties:
 *            homebaseName:
 *              type: string
 *            countryName:
 *              type: string
 *    responses:
 *      201:
 *        description: homebase created successfully
 */
homebaseRouter.post(
  '/homebases',
  HomebaseValidator.validateHomeBase,
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
 *      - name: country
 *        in: query
 *        required: false
 *        description: country name
 *        type: string
 *      - name: name
 *        in: query
 *        required: false
 *        description: name of homebase
 *        type: string
 *    responses:
 *      200:
 *        description: success response object containing all found homebases
 *      404:
 *        description: no homebases found on the database
 */
homebaseRouter.get(
  '/homebases',
  GeneralValidator.validateQueryParams,
  HomebaseController.getHomebases
);

/**
 * @swagger
 * /homebases/{id}:
 *  put:
 *    summary: update homebase
 *    tags:
 *      - Homebases
 *    parameters:
 *      - homebaseName: body
 *      - countryName: body
 *      - id: path
 *      - channel: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - id
 *          properties:
 *            id:
 *              type: integer
 *              description: The home base Id
 *            homebaseName:
 *              type: string
 *            countryName:
 *              type: string
 *            channel:
 *              type: string
 *              description: The homebase channel
 *
 *    responses:
 *      200:
 *        description: success response object containing all found homebases
 *      404:
 *        description: Homebase or country does not exist
 *      409:
 *        description: Homebase with specified name already exists
 */
homebaseRouter.put(
  '/homebases/:id',
  HomebaseValidator.validateHomeBaseIdQueryParam,
  HomebaseValidator.validateUpdateHomeBase,
  HomebaseValidator.validateHomeBaseExists,
  HomebaseValidator.validateCountryExists,
  HomebaseController.update
);


export default homebaseRouter;
