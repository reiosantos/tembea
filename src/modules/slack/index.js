import express from 'express';
import SlackController from './SlackController';
import slackInteractionsRouter from './SlackInteractions/SlackInteractionsRouter';
import middlewares from '../../middlewares';

const { CleanRequestBody } = middlewares;
const SlackRouter = express.Router();
const slackCommandHandler = [
  CleanRequestBody.trimAllInputs,
  SlackController.handleSlackCommands,
  SlackController.launch,
];

SlackRouter.use('/actions', slackInteractionsRouter.expressMiddleware());
SlackRouter.post('/command', ...slackCommandHandler);

export default SlackRouter;
