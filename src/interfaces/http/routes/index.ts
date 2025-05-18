import { Router } from 'express';
import authRoutes from './auth.routes';
import shipmentRoutes from './shipment.routes';

const router = Router();

// Registrar las rutas de autenticación
router.use('/auth', authRoutes);

// Registrar las rutas de envíos
router.use('/shipments', shipmentRoutes);

export default router;
