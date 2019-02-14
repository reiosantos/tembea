import express from 'express';
import AISController from './AISController';
import UserValidator from '../../middlewares/UserValidator';

const aisRouter = express.Router();

aisRouter.get(
  '/ais',
  UserValidator.validateEmail,
  AISController.getUserDataByEmail
);

export default aisRouter;
