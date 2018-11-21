import express from 'express';
import SlackController from './SlackController';

const SlackRouter = express.Router();

SlackRouter.post('/slack/command', SlackController.launch);

export default SlackRouter;
