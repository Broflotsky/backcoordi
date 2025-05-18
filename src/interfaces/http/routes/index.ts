import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Registrar las rutas de autenticación
router.use('/auth', authRoutes);

export default router;
