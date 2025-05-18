import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './interfaces/http/routes';
import { errorHandler } from './interfaces/http/middlewares/errorHandler';
import { setupSwagger } from '@config/swagger';

// Carga las variables de entorno
dotenv.config();

// Crea la aplicación Express
const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Punto final de verificación de estado
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'El servidor está funcionando'
  });
});

// Rutas de la API
app.use('/api/v1', routes);

// Configura la documentación de Swagger
setupSwagger(app);

// Middleware para manejar rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `No se encontró la ruta ${req.originalUrl}`
  });
});

// Middleware para manejar errores
app.use(errorHandler);

export default app;
