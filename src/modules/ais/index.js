import express from 'express';
import AISController from './AISController';
import UserValidator from '../../middlewares/UserValidator';

const aisRouter = express.Router();

/**
 * @swagger
 * /ais:
 *  get:
 *    summary: get user details from AIS
 *    tags:
 *      - AIS
 *    parameters:
 *      - name: email
 *        in: query
 *        required: true
 *        description: email address of user
 *        type: string
 *    responses:
 *      200:
 *        description: response object containing the user details
 */
aisRouter.get(
  '/ais',
  UserValidator.getUserRoles,
  AISController.getUserDataByEmail
);

export default aisRouter;
