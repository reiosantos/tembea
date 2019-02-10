import express from 'express';
import TokenValidator from '../../middlewares/TokenValidator';
import RoutesController from './RouteController';
import middlewares from '../../middlewares';

const { GeneralValidator, RouteValidator } = middlewares;
const routesRouter = express.Router();

routesRouter.get(
  '/routes',
  GeneralValidator.validateQueryParams,
  RoutesController.getRoutes
);

routesRouter.post(
  '/routes',
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

export default routesRouter;
