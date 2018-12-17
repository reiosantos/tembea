import slackRouter from './slack';
import slackInteractionsRouter from './slack/SlackInteractions/SlackInteractionsRouter';
import homeRouter from './home';
import userRouter from './users';
import departmentRouter from './departments';

const apiPrefix = '/api/v1';

const routes = (app) => {
  app.use(homeRouter);
  app.use(apiPrefix, userRouter);
  app.use(apiPrefix, departmentRouter);
  app.use(apiPrefix, slackRouter);
  app.use(`${apiPrefix}/slack/actions`, slackInteractionsRouter.expressMiddleware());
  return app;
};

export default routes;
