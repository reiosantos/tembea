import slackRouter from './slack';

const apiPrefix = '/api/v1';

const routes = (app) => {
  app.use(apiPrefix, slackRouter);
  return app;
};

export default routes;
