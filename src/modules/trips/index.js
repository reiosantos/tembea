import { Router } from 'express';
import TripController from './TripController';
import middlewares from '../../middlewares';
import TokenValidator from '../../middlewares/TokenValidator';

const { GeneralValidator } = middlewares;
const tripsRouter = Router();

tripsRouter.use('/trips',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken);

tripsRouter.get(
  '/trips',
  GeneralValidator.validateQueryParams,
  TripController.getTrips
);

export default tripsRouter;
