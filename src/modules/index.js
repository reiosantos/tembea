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
import aisRouter from './ais';

const apiPrefix = '/api/v1';

const routes = (app) => {
  app.use(homeRouter);
  app.use(apiPrefix, userRouter);
  app.use(apiPrefix, departmentRouter);
  app.use(apiPrefix, addressRouter);
  app.use(apiPrefix, slackClientAuth, slackRouter);
  app.use(apiPrefix, departmentRouter);
  app.use(apiPrefix, routesRouter);
  app.use(`${apiPrefix}/slack/actions`, slackClientAuth,
    slackInteractionsRouter.expressMiddleware());

  app.use(apiPrefix, authenticationRouter);
  app.use(apiPrefix, roleManagementRouter);
  app.use(apiPrefix, routesRouter);
  app.use(apiPrefix, aisRouter);
  return app;
};

export default routes;
