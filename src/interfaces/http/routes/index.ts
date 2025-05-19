import { Router } from 'express';
import authRoutes from './auth.routes';
import shipmentRoutes from './shipment.routes';
import assignmentRoutes from './assignment.routes';

const router = Router();

// Registrar las rutas de autenticación
router.use('/auth', authRoutes);

// Registrar las rutas de envíos
router.use('/shipments', shipmentRoutes);

// Registrar las rutas de asignación de envíos
router.use('/assignments', assignmentRoutes);

export default router;
