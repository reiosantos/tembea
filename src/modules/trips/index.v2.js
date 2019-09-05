import { Router } from 'express';
import middlewares from '../../middlewares';
import TripsController from './TripsController';
import HomeBaseFilterValidator from '../../middlewares/HomeBaseFilterValidator';


const { TokenValidator, GeneralValidator, } = middlewares;

const tripsV2Router = Router();

tripsV2Router.use('/trips',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken);


/**
 * @swagger
 * /trips/routetrips:
 *  post:
 *    summary: fetch route trips for a specified period
 *    tags:
 *      - Trips
 *    parameters:
 *      - name: page
 *        in: query
 *        required: false
 *      - name: size
 *        in: query
 *        required: false
 *    responses:
 *      200:
 *        description: route trips fetched successfully
 *      400:
 *        description: bad request
 */
tripsV2Router.get(
  '/trips/routetrips',
  HomeBaseFilterValidator.validateHomeBaseAccess,
  GeneralValidator.validateQueryParams,
  TripsController.getRouteTrips
);

export default tripsV2Router;
