import { Router } from 'express';
import middlewares from '../../middlewares';
import TripsController from './TripsController';

const { TripValidator, TokenValidator } = middlewares;

const tripsRouter = Router();

tripsRouter.use('/trips',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken);

/**
 * @swagger
 * /trips:
 *  get:
 *    summary: fetch all trips
 *    tags:
 *      - Trips
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
 *      - name: status
 *        in: query
 *        required: false
 *        description: trip status
 *        type: string
 *        enum:
 *          - Pending
 *          - Approved
 *          - Confirmed
 *      - name: department
 *        in: query
 *        required: false
 *        description: department of the trip taker
 *        type: string
 *      - name: departureTime
 *        in: query
 *        required: false
 *        description: format - before:YYYY-MM-DD;after:YYYY-MM-DD (example - before:2018-12-30;after:2018-01-01)
 *        example: before:2018-12-30;after:2018-01-01
 *        type: string
 *      - name: requestedOn
 *        in: query
 *        required: false
 *        description: format - before:YYYY-MM-DD;after:YYYY-MM-DD
 *        type: string
 *      - name: type
 *        in: query
 *        required: false
 *        description: type of trip
 *        type: string
 *        enum:
 *          - Regular Trip
 *          - Airport Transfer
 *          - Embassy Visit
 *    responses:
 *      200:
 *        description: response object containing all trips from the database
 */
tripsRouter.get(
  '/trips',
  TripValidator.validateGetTripsParam,
  TripsController.getTrips
);

/**
 * @swagger
 * /trips/{tripId}:
 *  put:
 *    summary: update trip status
 *    tags:
 *      - Trips
 *    parameters:
 *      - name: tripId
 *        in: path
 *        required: true
 *        description: id of request to be updated
 *        type: number
 *      - name: action
 *        in: query
 *        required: true
 *        type: string
 *        enum:
 *          - "confirm"
 *          - "decline"
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - slackUrl
 *            - driverName
 *            - driverPhoneNo
 *            - regNumber
 *            - comment
 *          properties:
 *            slackUrl:
 *              type: string
 *              example: andela-tembea.slack.com
 *            driverName:
 *              type: string
 *            driverPhoneNo:
 *              type: string
 *              example: "0182947583028"
 *            regNumber:
 *              type: string
 *              description: vehichle registration number
 *            comment:
 *              type: string
 *    responses:
 *      200:
 *        description: trip status updated succcessfully
 */
tripsRouter.put(
  '/trips/:tripId',
  TripValidator.validateAll,
  TripsController.updateTrip
);

/**
 * @swagger
 * /trips/travel:
 *  post:
 *    summary: fetch travel trips for specified period by department
 *    tags:
 *      - Trips
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - startDate
 *            - endDate
 *            - departmentList
 *          properties:
 *            startDate:
 *              type: string
 *            endDate:
 *              type: string
 *            departmentList:
 *              description: array of departments
 *              type: array
 *    responses:
 *      200:
 *        description: travel trips fetched successfully
 *      400:
 *        description: bad format  request body parameters
 */
tripsRouter.post(
  '/trips/travel',
  TripValidator.validateTravelTrip,
  TripsController.getTravelTrips
);

export default tripsRouter;
