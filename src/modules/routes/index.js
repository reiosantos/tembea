import express from 'express';
import TokenValidator from '../../middlewares/TokenValidator';
import RoutesController from './RouteController';
import middlewares from '../../middlewares';

const { GeneralValidator } = middlewares;
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

routesRouter.get('/routes/requests',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  RoutesController.getAll);

export default routesRouter;
