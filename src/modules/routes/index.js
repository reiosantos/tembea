import express from 'express';
import TokenValidator from '../../middlewares/TokenValidator';
import RoutesController from './RouteController';
import middlewares from '../../middlewares';

const { GeneralValidator, RouteValidator, RouteRequestValidator } = middlewares;
const routesRouter = express.Router();

routesRouter.get(
  '/routes',
  GeneralValidator.validateQueryParams,
  RoutesController.getRoutes
);

routesRouter.post(
  '/routes',
  RouteValidator.verifyAllPropsExist,
  RouteValidator.verifyPropsValuesAreSetAndValid,
  RouteValidator.validateDestinationAddress,
  RouteValidator.validateDestinationCoordinates,
  RoutesController.createRoute
);

routesRouter.put(
  '/routes/:routeId',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  RouteValidator.validateRouteIdParam,
  GeneralValidator.validateTeamUrlInRequestBody,
  GeneralValidator.validateAllProvidedReqBody,
  RouteValidator.validateRouteBatchStatus,
  RoutesController.updateRouteBatchStatus
);

routesRouter.get('/routes/requests',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  RoutesController.getAll);

routesRouter.put(
  '/routes/requests/status/:requestId',
  RouteRequestValidator.validateRequestBody,
  RouteRequestValidator.validateParams,
  RouteRequestValidator.validateRouteStatus,
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  RoutesController.changeRouteRequestStatus
);

routesRouter.delete(
  '/routes/:routeBatchId',
  GeneralValidator.validateTeamUrlInRequestBody,
  RouteValidator.validateRouteIdParam,
  RoutesController.deleteRouteBatch
);

export default routesRouter;
