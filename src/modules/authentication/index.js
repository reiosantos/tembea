import express from 'express';
import AuthenticationController from './AuthenticationController';
import middlewares from '../../middlewares';

const authenticationRouter = express.Router();
const { TokenValidator } = middlewares;

// verify user role access to tembea with andela auth service token
authenticationRouter.get(
  '/auth/verify',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken,
  AuthenticationController.verifyUser
);

export default authenticationRouter;
