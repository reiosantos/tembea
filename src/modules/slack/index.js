import express from 'express';
import SlackController from './SlackController';
import slackInteractionsRouter from './SlackInteractions/SlackInteractionsRouter';
import middlewares from '../../middlewares';
import GeneralValidator from '../../middlewares/GeneralValidator';

const { CleanRequestBody } = middlewares;
const SlackRouter = express.Router();
const slackCommandHandler = [
  CleanRequestBody.trimAllInputs,
  SlackController.handleSlackCommands,
  SlackController.launch,
];

SlackRouter.use('/actions', slackInteractionsRouter.expressMiddleware());
SlackRouter.post('/command', ...slackCommandHandler);

/**
* @swagger
* /slack/channels:
*  get:
*    summary: fetch all channels in the slack workspace
*    tags:
*      - channels
*    parameters:
*      - name: teamUrl
*        in: header
*        required: true
*        description: the team url (slack)
*        type: string
*    responses:
*      200:
*        description: response containing a list of channels
*/
SlackRouter.get('/channels', GeneralValidator.validateSlackUrl, SlackController.getChannels);

export default SlackRouter;
