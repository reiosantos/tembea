import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const getDefinition = (version) => ({
  info: {
    title: 'Tembea API Docs',
    version: `${version}.0.0`,
    description: `Docs for the Tembea API (v${version})`
  },
  schemes: ['http', 'https'],
  basePath: `/api/v${version}/`,
  produces: ['application/json'],
  consumes: ['application/json'],
  securityDefinitions: {
    JWT: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  },
  security: [{ JWT: [] }]
});

export const v1JSDoc = swaggerJSDoc({
  swaggerDefinition: getDefinition(1),
  apis: ['./**/index.js']
});

export const v2JSDoc = swaggerJSDoc({
  swaggerDefinition: getDefinition(2),
  apis: ['./**/index.v2.js']
});

export const setupSwaggerUI = (app, url, spec, options) => {
  app.use(url, swaggerUi.serve, swaggerUi.serveFiles(spec, options));
  app.get(url, (req, res) => {
    res.send(swaggerUi.generateHTML(spec, options));
  });
};
