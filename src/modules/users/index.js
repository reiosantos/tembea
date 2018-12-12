import express from 'express';
import UsersController from './UsersController';
import middlewares from '../../middlewares';

const { UserValidator } = middlewares;
const userRouter = express.Router();

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

export default userRouter;
