import express from 'express';
import HomeController from './HomeController';

const homeRouter = express.Router();

homeRouter.get('/', HomeController.index);
homeRouter.get('/slackauth', HomeController.auth);
homeRouter.get('/install', HomeController.install);
homeRouter.get('/privacy', HomeController.privacy);
homeRouter.get('/support', HomeController.support);

export default homeRouter;
