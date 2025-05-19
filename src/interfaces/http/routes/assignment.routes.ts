import { Router } from "express";
import { 
  assignShipmentToRoute, 
  getAvailableRoutes, 
  getAvailableTransporters, 
  getPendingShipments,
  getShipmentAssignments
} from "../controllers/ShipmentAssignmentController";
import { assignmentValidator } from "../validators/assignment.validator";
import { validation } from "../validators/validation";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const assignmentRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Gestión de asignaciones de envíos a rutas y transportistas
 */

/**
 * @swagger
 * /api/v1/assignments:
 *   post:
 *     summary: Asignar un envío a una ruta
 *     description: Asigna un envío existente a una ruta y opcionalmente a un transportista
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipment_id
 *               - route_id
 *             properties:
 *               shipment_id:
 *                 type: integer
 *                 description: ID del envío a asignar
 *               route_id:
 *                 type: integer
 *                 description: ID de la ruta a la que asignar el envío
 *               transporter_id:
 *                 type: integer
 *                 description: ID del transportista (opcional)
 *               notes:
 *                 type: string
 *                 description: Notas adicionales sobre la asignación
 *     responses:
 *       201:
 *         description: Envío asignado correctamente
 *       400:
 *         description: Datos de entrada inválidos o error en la asignación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido (solo admin)
 */
assignmentRouter.post(
  "/", 
  authMiddleware, 
  roleMiddleware(1),
  assignmentValidator, 
  validation, 
  assignShipmentToRoute
);

/**
 * @swagger
 * /api/v1/assignments:
 *   get:
 *     summary: Obtener asignaciones de envíos
 *     description: Obtiene todas las asignaciones de envíos con filtros opcionales
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: route_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de ruta
 *       - in: query
 *         name: transporter_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de transportista
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de completado
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (formato YYYY-MM-DD)
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *       401:
 *         description: No autorizado
 */
assignmentRouter.get("/", authMiddleware, getShipmentAssignments);

/**
 * @swagger
 * /api/v1/assignments/routes:
 *   get:
 *     summary: Obtener rutas disponibles
 *     description: Obtiene todas las rutas disponibles con opción de filtrado
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: origin_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de origen
 *       - in: query
 *         name: destination_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de destino
 *     responses:
 *       200:
 *         description: Lista de rutas disponibles
 *       401:
 *         description: No autorizado
 */
assignmentRouter.get("/routes", authMiddleware, getAvailableRoutes);

/**
 * @swagger
 * /api/v1/assignments/transporters:
 *   get:
 *     summary: Obtener transportistas disponibles
 *     description: Obtiene todos los transportistas disponibles con capacidad suficiente
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *         description: Capacidad mínima requerida (en gramos)
 *     responses:
 *       200:
 *         description: Lista de transportistas disponibles
 *       401:
 *         description: No autorizado
 */
assignmentRouter.get("/transporters", authMiddleware, getAvailableTransporters);

/**
 * @swagger
 * /api/v1/assignments/pending-shipments:
 *   get:
 *     summary: Obtener envíos pendientes
 *     description: Obtiene todos los envíos pendientes de asignación a una ruta
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de envíos pendientes
 *       401:
 *         description: No autorizado
 */
assignmentRouter.get("/pending-shipments", authMiddleware, getPendingShipments);

export default assignmentRouter;
