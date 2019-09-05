import { setupSwaggerUI, v2JSDoc } from './apiSpec';
import routesV2Router from './routes/index.v2';
import tripsV2Router from './trips/index.v2';

const apiV2Prefix = '/api/v2';

const apiDocsOptions = {
  customSiteTitle: 'Tembea API Documentation',
  customCss: '.swagger-ui .topbar { display: none }'
};

const routes = (app) => {
  app.use(apiV2Prefix, tripsV2Router);
  app.use(apiV2Prefix, routesV2Router);
  setupSwaggerUI(app, '/docs/v2', v2JSDoc, apiDocsOptions);
  return app;
};

export default routes;
