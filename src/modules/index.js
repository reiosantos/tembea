import swaggerUi from 'swagger-ui-express';
import apiSpec from './apiSpec';
import routesRouter from './routes';
import tripsRouter from './trips';
import slackRouter from './slack';
import homeRouter from './home';
import userRouter from './users';
import departmentRouter from './departments';
import addressRouter from './addresses';
import slackClientAuth from '../middlewares/slackClientAuth';
import roleManagementRouter from './roleManagement';
import authenticationRouter from './authentication';
import aisRouter from './ais';
import exportsRouter from './exports';
import cabsRouter from './cabs';
import countryRouter from './countries';
import fellowsRouter from './fellows';

const apiPrefix = '/api/v1';
const apiDocsOptions = {
  customSiteTitle: 'Tembea API Documentation',
  customCss: '.swagger-ui .topbar { display: none }'
};

const routes = (app) => {
  app.use(homeRouter);
  app.use(apiPrefix, userRouter);
  app.use(apiPrefix, addressRouter);
  app.use(`${apiPrefix}/slack`, slackClientAuth, slackRouter);
  app.use(apiPrefix, departmentRouter);
  app.use(apiPrefix, routesRouter);
  app.use(apiPrefix, tripsRouter);
  app.use(apiPrefix, authenticationRouter);
  app.use(apiPrefix, roleManagementRouter);
  app.use(apiPrefix, routesRouter);
  app.use(apiPrefix, countryRouter);
  app.use(apiPrefix, aisRouter);
  app.use(apiPrefix, cabsRouter);
  app.use('/docs/v1', swaggerUi.serve, swaggerUi.setup(apiSpec, apiDocsOptions));
  app.use(apiPrefix, exportsRouter);
  app.use(apiPrefix, fellowsRouter);
  
  return app;
};

export default routes;
