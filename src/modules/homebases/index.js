import express from 'express';
import HomebaseController from './HomebaseController';
import middlewares from '../../middlewares';
import HomebaseValidator from '../../middlewares/HomebaseValidator';

const {
  TokenValidator
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


export default homebaseRouter;
