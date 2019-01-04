import EmailController from './report/EmailController';
import slackRouter from './slack';
import slackInteractionsRouter from './slack/SlackInteractions/SlackInteractionsRouter';
import homeRouter from './home';
import userRouter from './users';
import departmentRouter from './departments';
import addressRouter from './addresses';
import slackClientAuth from '../middlewares/slackClientAuth';

const apiPrefix = '/api/v1';

const routes = (app, hbs) => {
  app.use(homeRouter);
  app.use(apiPrefix, userRouter);
  app.use(apiPrefix, departmentRouter);
  app.use(apiPrefix, addressRouter);
  app.use(apiPrefix, slackClientAuth, slackRouter);
  app.use(apiPrefix, departmentRouter);
  app.use(`${apiPrefix}/slack/actions`, slackClientAuth,
    slackInteractionsRouter.expressMiddleware());

  app.use(`${apiPrefix}/template/email/report`,
    (req, res) => EmailController.generateTemplate(req, res, hbs));

  return app;
};

export default routes;
