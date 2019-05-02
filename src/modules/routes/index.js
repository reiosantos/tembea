import express from 'express';
import TokenValidator from '../../middlewares/TokenValidator';
import RoutesController from './RouteController';
import RoutesUsageController from './RouteUsageController';
import middlewares from '../../middlewares';

const {
  GeneralValidator, RouteValidator, RouteRequestValidator, CleanRequestBody
} = middlewares;
const routesRouter = express.Router();

routesRouter.use(
  '/routes',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
);
/**
 * @swagger
 * /routes:
 *  get:
 *    summary: Gets all available route batches from the database
 *    tags:
 *      - Routes
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
 *      - name: sort
 *        in: query
 *        required: false
 *        description: sorting order of response (**_name,asc,id,asc_** or **_name,desc,id,asc_** or simply **_name,asc_** or **_name,desc_** or **_name,asc_**. The world is your oyster)
 *        type: string
 *    responses:
 *      200:
 *        description: returns response object containing all available routes
 */
routesRouter.get(
  '/routes',
  GeneralValidator.validateQueryParams,
  RoutesController.getRoutes
);

/**
 * @swagger
 * /routes:
 *  post:
 *    summary: create routes
 *    tags:
 *      - Routes
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - routeName
 *            - destination
 *            - vehicle
 *            - takeOffTime
 *            - capacity
 *          properties:
 *            routeName:
 *              type: string
 *            vehicle:
 *              type: string
 *              description: vehicle registration number
 *            takeOffTime:
 *              type: string
 *              example: "10:00"
 *            capacity:
 *              type: number
 *              example: 7
 *            destination:
 *              type: object
 *              example: { "address": "Abia!", "coordinates": { "lng": 7, "lat": 11 } }
 *    responses:
 *      200:
 *        description: route batch created successfully
 *      400:
 *        description: input contains errors
 */
routesRouter.post(
  '/routes',
  CleanRequestBody.trimAllInputs,
  RouteValidator.verifyAllPropsExist,
  RouteValidator.verifyPropsValuesAreSetAndValid,
  RouteValidator.validateDestinationAddress,
  RouteValidator.validateDestinationCoordinates,
  RoutesController.createRoute
);

/**
 * @swagger
 * /routes/{routeId}:
 *  put:
 *    summary: update route batch details
 *    tags:
 *      - Routes
 *    parameters:
 *      - name: routeId
 *        in: path
 *        description: id of the route batch to be updated
 *        required: true
 *        type: number
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - teamUrl
 *          properties:
 *            teamUrl:
 *              type: string
 *              example: example.slack.com
 *              description: team slack workspace URL
 *            status:
 *              example: "Active"
 *              type: string
 *              enum:
 *                - Inactive
 *                - Active
 *            batch:
 *              type: string
 *            capacity:
 *              type: number
 *              example: 8
 *              description: route capacity **(must be greater than 0)**
 *            takeOff:
 *              type: string
 *              description: time for takeoff **(24H format)**
 *              example: "10:00"
 *            regNumber:
 *              type: string
 *              description: vehicle registration number
 *            name:
 *              type: string
 *              description: route name
 *    responses:
 *      200:
 *        description: route batch successfully updated
 *      400:
 *        description: request object contains errors
 */
routesRouter.put(
  '/routes/:routeId',
  CleanRequestBody.trimAllInputs,
  RouteValidator.validateRouteIdParam,
  GeneralValidator.validateTeamUrlInRequestBody,
  GeneralValidator.validateAllProvidedReqBody,
  RouteValidator.validateRouteBatchStatus,
  RouteValidator.validateRouteBatchUpdateFields,
  RoutesController.updateRouteBatch
);

/**
 * @swagger
 * /routes/requests:
 *  get:
 *    summary: get all confirmed route requests
 *    tags:
 *      - Routes
 *    responses:
 *      200:
 *        description: response object containing confirmed route requests
 */
routesRouter.get('/routes/requests',
  RoutesController.getAll);

/**
 * @swagger
 * /routes/requests/status/{requestId}:
 *  put:
 *    summary: decline/approve a route request
 *    tags:
 *      - Routes
 *    parameters:
 *      - name: requestId
 *        in: path
 *        required: true
 *        description: id of request to be updated
 *        type: number
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - teamUrl
 *            - newOpsStatus
 *            - reviewerEmail
 *            - comment
 *            - routeName
 *            - capacity
 *            - takeOff
 *            - cabRegNumber
 *          properties:
 *            teamUrl:
 *              type: string
 *              example: andela-tembea.slack.com
 *            newOpsStatus:
 *              type: string
 *              description: can be either of **approve** or **decline**
 *              example: approve
 *              enum:
 *                - approve
 *                - decline
 *            reviewerEmail:
 *              type: string
 *            comment:
 *              type: string
 *            routeName:
 *              type: string
 *              description: this is **required** if route is to be approved
 *            capacity:
 *              type: number
 *              example: 6
 *            takeOff:
 *              type: string
 *              example: "10:00"
 *            cabRegNumber:
 *              type: string
 *    responses:
 *      200:
 *        description: route request status updated successfully
 *      400:
 *        description: errors in the request object
 *      401:
 *        description: not authenticated
 *      403:
 *        description: route request needs to be confirmed by manager first
 *      409:
 *        description: route request has already been approved
 */
routesRouter.put(
  '/routes/requests/status/:requestId',
  CleanRequestBody.trimAllInputs,
  RouteRequestValidator.validateRequestBody,
  RouteRequestValidator.validateParams,
  RouteRequestValidator.validateRouteStatus,
  RoutesController.changeRouteRequestStatus
);

/**
 * @swagger
 * /routes/{routeBatchId}:
 *  delete:
 *    summary: delete specific route batch
 *    tags:
 *      - Routes
 *    parameters:
 *      - name: routeBatchId
 *        in: path
 *        required: true
 *        description: id of route batch to be deleted
 *        type: number
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - teamUrl
 *          properties:
 *            teamUrl:
 *              type: string
 *              description: team slack workspace url
 *              example: andela-tembea.slack.com
 *    responses:
 *      200:
 *        description: route batch deletion successful
 *      400:
 *        description: errors in the request body object
 *      404:
 *        description: route batch not found
 */
routesRouter.delete(
  '/routes/:routeBatchId',
  CleanRequestBody.trimAllInputs,
  GeneralValidator.validateTeamUrlInRequestBody,
  RouteValidator.validateRouteIdParam,
  RoutesController.deleteRouteBatch
);

/**
 * @swagger
 * /routes/:id:
 *  get:
 *    summary: get a specic route's details
 *    tags:
 *      - Route Details
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: the id to the desired route
 *    responses:
 *      200:
 *        description: response object contains a Route's Details
 *      400:
 *        description: invalid id parameter
 *      404:
 *        description: no route associated to the id parameter passed
 */
routesRouter.get(
  '/routes/:id',
  GeneralValidator.validateRouteId,
  RoutesController.getOne
);

/**
 * @swagger
 * /routes/{routeBatchId}:
 *  delete:
 *    summary: delete specific route batch
 *    tags:
 *      - Routes
 *    parameters:
 *      - name: routeBatchId
 *        in: path
 *        required: true
 *        description: id of route batch to be deleted
 *        type: number
 *    responses:
 *      200:
 *        description: fellow removed from route successfully
 *      404:
 *        description: fellow not found
 */
routesRouter.delete(
  '/routes/fellows/:userId',
  GeneralValidator.validateTeamUrlInRequestBody,
  RouteValidator.validateRouteIdParam,
  RoutesController.deleteFellowFromRoute
);

/**
 * @swagger
 * /routes/status/usage:
 *  get:
 *    summary: Get the most and least used route batches
 *    tags:
 *      - Routes Usage
 *    parameters:
 *      - name: from
 *        in: path
 *        required: false
 *        description: the start date of the range you want to get records for. e.g 2019-05-08
 *        type: date
 *      - name: to
 *        in: path
 *        required: false
 *        description: the end date of the range you want to get records for e.g 2019-05-08
 *        type: date
 *    responses:
 *      200:
 *        description: Percentage Usage Generated
 */
routesRouter.get(
  '/routes/status/usage',
  RoutesUsageController.getRouteUsage
);

export default routesRouter;
