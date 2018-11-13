import slackRouter from './slack';
import slackInteractionsRouter from './slack/SlackInteractions/SlackInteractionsRouter';

const apiPrefix = '/api/v1';

const routes = (app) => {
  app.use(apiPrefix, slackRouter);
  app.use(`${apiPrefix}/slack/actions`, slackInteractionsRouter.expressMiddleware());
  return app;
};

export default routes;
