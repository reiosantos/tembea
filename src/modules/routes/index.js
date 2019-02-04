import express from 'express';
import TokenValidator from '../../middlewares/TokenValidator';
import RouteController from './RouteController';

const routesRouter = express.Router();

routesRouter.get('/routes/requests',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  RouteController.getAll);

export default routesRouter;
