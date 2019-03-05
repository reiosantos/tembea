import { Router } from 'express';
import middlewares from '../../middlewares';
import TripsController from './TripsController';

const { GeneralValidator, TripValidator, TokenValidator } = middlewares;

const tripsRouter = Router();

tripsRouter.use('/trips',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken);

tripsRouter.get(
  '/trips',
  GeneralValidator.validateQueryParams,
  TripsController.getTrips
);

const tripValidator = [TripValidator.validateAll, TripValidator.validateEachInput];
tripsRouter.put(
  '/trips/:tripId',
  ...tripValidator,
  TripsController.updateTrip
);

export default tripsRouter;
