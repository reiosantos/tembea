import swaggerJSDoc from 'swagger-jsdoc';

export default swaggerJSDoc({
  swaggerDefinition: {
    info: {
      title: 'Tembea API Docs',
      version: '1.0.0',
      description: 'Docs for the Tembea API (v1)'
    },
    schemes: ['http', 'https'],
    basePath: '/api/v1/',
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
  },
  apis: ['./**/index.js']
});
