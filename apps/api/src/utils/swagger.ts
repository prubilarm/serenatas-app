import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'El Mariachi Aventurero API',
      version: '1.0.0',
      description: 'API para la gestión de serenatas, pagos y clientes',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor Local',
      },
      {
        url: 'https://serenatas-app-api.vercel.app', // URL tentativa de Vercel
        description: 'Servidor Producción',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Archivos donde buscaremos la documentación
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('Swagger docs available at /docs');
};
