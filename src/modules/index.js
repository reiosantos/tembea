import EmailController from './report/EmailController';
import routesRouter from './routes';
import slackRouter from './slack';
import slackInteractionsRouter from './slack/SlackInteractions/SlackInteractionsRouter';
import homeRouter from './home';
import userRouter from './users';
import departmentRouter from './departments';
import addressRouter from './addresses';
import slackClientAuth from '../middlewares/slackClientAuth';
import roleManagementRouter from './roleManagement';
import authenticationRouter from './authentication';

const apiPrefix = '/api/v1';

const routes = (app, hbs) => {
  app.use(homeRouter);
  app.use(apiPrefix, userRouter);
  app.use(apiPrefix, departmentRouter);
  app.use(apiPrefix, addressRouter);
  app.use(apiPrefix, slackClientAuth, slackRouter);
  app.use(apiPrefix, departmentRouter);
  app.use(apiPrefix, routesRouter);
  app.use(`${apiPrefix}/slack/actions`, slackClientAuth,
    slackInteractionsRouter.expressMiddleware());

  app.use(`${apiPrefix}/template/email/report`,
    (req, res) => EmailController.generateTemplate(req, res, hbs));

  app.use(apiPrefix, authenticationRouter);
  app.use(apiPrefix, roleManagementRouter);

  return app;
};

export default routes;
