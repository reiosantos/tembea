import express from 'express';
import SlackController from './SlackInteractions/SlackController';

const SlackRouter = express.Router();

SlackRouter.post('/slack', SlackController.launch);

export default SlackRouter;
