import express from 'express';
import SlackController from './SlackController';
import slackInteractionsRouter from './SlackInteractions/SlackInteractionsRouter';

const SlackRouter = express.Router();
const slackCommandHandler = [
  SlackController.handleSlackCommands,
  SlackController.launch,
];

SlackRouter.use('/actions', slackInteractionsRouter.expressMiddleware());
SlackRouter.post('/command', ...slackCommandHandler);

export default SlackRouter;
