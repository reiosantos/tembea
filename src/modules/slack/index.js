import express from 'express';
import SlackController from './SlackController';


const SlackRouter = express.Router();
const slackCommandHandler = [
  SlackController.travel,
  SlackController.route,
  SlackController.launch,
];

SlackRouter.post('/slack/command', ...slackCommandHandler);

export default SlackRouter;
