import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import path from 'path';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API prueba técnica de Coordinadora',
      version: '1.0.0',
      description: 'Documentación de la API del sistema de gestión de envíos, esto es una prueba técnica y no tiene ninguna funcionalidad real.',
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
      contact: {
        name: 'Iván Reyes',
        url: 'https://github.com/Broflotsky',
        email: 'ivancho0@hotmail.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || '3000'}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve(__dirname, '../interfaces/http/routes/*.routes.ts'),
    path.resolve(__dirname, '../interfaces/http/routes/*.routes.js'), 
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API de Coordinadora - Documentación',
  }));

  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Documentación de Swagger disponible en /docs`);
};
