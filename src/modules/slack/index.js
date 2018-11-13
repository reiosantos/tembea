import express from 'express';
import SlackController from './SlackController';

const SlackRouter = express.Router();

SlackRouter.get('/slack', SlackController.launch);
SlackRouter.post('/slack', SlackController.launch);

export default SlackRouter;
