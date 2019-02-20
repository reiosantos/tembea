import express from 'express';
import UsersController from './UsersController';
import middlewares from '../../middlewares';

const { GeneralValidator, UserValidator, TokenValidator } = middlewares;
const userRouter = express.Router();

userRouter.use(
  '/users',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken
);

userRouter.put(
  '/users',
  UserValidator.validateEmail,
  UserValidator.validateUpdateBody,
  UserValidator.validateUpdateInfo,
  UsersController.updateRecord
);

userRouter.post(
  '/users',
  UserValidator.validateEmail,
  UserValidator.validateUserBody,
  UsersController.newUserRecord
);

userRouter.get(
  '/users',
  GeneralValidator.validateQueryParams,
  UsersController.readRecords
);

export default userRouter;
