import { Router } from "express";
import { createShipment } from "../controllers/ShipmentController";
import { 
  getShipmentStatusByTrackingCode,
  getShipmentStatusHistoryByTrackingCode,
  updateShipmentStatus 
} from "../controllers/ShipmentStatusController";
import { shipmentValidator } from "../validators/shipment.validator";
import { shipmentStatusValidator } from "../validators/shipmentStatus.validator";
import { validation } from "../validators/validation";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const shipmentRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Shipments
 *   description: Gestión de envíos
 */

/**
 * @swagger
 * tags:
 *   name: Estado de Envíos
 *   description: Seguimiento y actualización de estados de envíos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShipmentStatus:
 *       type: object
 *       required:
 *         - id
 *         - shipment_id
 *         - status
 *         - timestamp
 *         - created_by
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del estado del envío
 *         shipment_id:
 *           type: integer
 *           description: ID del envío al que pertenece este estado
 *         status:
 *           type: string
 *           enum: [En espera, En transito, Entregado]
 *           description: Estado actual del envío
 *         comment:
 *           type: string
 *           description: Comentario opcional sobre el estado
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora en que se registró el estado
 *         created_by:
 *           type: integer
 *           description: ID del usuario que creó el estado
 *         user_name:
 *           type: string
 *           description: Nombre del usuario que creó el estado
 *         shipment_code:
 *           type: string
 *           description: Código de seguimiento del envío
 *         shipment_origin:
 *           type: integer
 *           description: ID de la ubicación de origen
 *         shipment_destination:
 *           type: integer
 *           description: ID de la ubicación de destino
 *
 *     StatusHistory:
 *       type: object
 *       properties:
 *         shipment:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: ID del envío
 *             tracking_code:
 *               type: string
 *               description: Código de seguimiento del envío
 *             origin_id:
 *               type: integer
 *               description: ID de la ubicación de origen
 *             destination_id:
 *               type: integer
 *               description: ID de la ubicación de destino
 *             created_at:
 *               type: string
 *               format: date-time
 *               description: Fecha de creación del envío
 *         status_history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ShipmentStatus'
 *           description: Historial completo de estados del envío
 *
 *     StatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [En espera, En transito, Entregado]
 *           description: Nuevo estado del envío
 *         comment:
 *           type: string
 *           description: Comentario opcional sobre el cambio de estado
 */

/**
 * @swagger
 * /api/v1/shipments:
 *   post:
 *     summary: Crear un nuevo envío
 *     description: Crea un nuevo envío en el sistema con la información proporcionada
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origin_id
 *               - destination_id
 *               - product_type_id
 *               - weight_grams
 *               - dimensions
 *               - recipient_name
 *               - recipient_address
 *               - recipient_phone
 *               - recipient_document
 *             properties:
 *               origin_id:
 *                 type: integer
 *                 description: ID de la ciudad de origen
 *               destination_id:
 *                 type: integer
 *                 description: ID de la ciudad de destino
 *               destination_detail:
 *                 type: string
 *                 description: Detalles adicionales sobre el destino (opcional)
 *               product_type_id:
 *                 type: integer
 *                 description: ID del tipo de producto (1=Sobre, 2=Paquete, 3=Paquete pesado)
 *               weight_grams:
 *                 type: integer
 *                 minimum: 1
 *                 description: Peso del envío en gramos
 *               dimensions:
 *                 type: string
 *                 description: Dimensiones del envío (ej. "30x20x15 cm")
 *               recipient_name:
 *                 type: string
 *                 description: Nombre completo del destinatario
 *               recipient_address:
 *                 type: string
 *                 description: Dirección completa del destinatario
 *               recipient_phone:
 *                 type: string
 *                 description: Teléfono del destinatario
 *               recipient_document:
 *                 type: string
 *                 description: Documento de identidad del destinatario
 *     responses:
 *       201:
 *         description: Envío creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 tracking_code:
 *                   type: string
 *                 user_id:
 *                   type: integer
 *                 origin_id:
 *                   type: integer
 *                 destination_id:
 *                   type: integer
 *                 product_type_id:
 *                   type: integer
 *                 weight_grams:
 *                   type: integer
 *                 dimensions:
 *                   type: string
 *                 recipient_name:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Token no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No se ha proporcionado un token de autenticación
 *       403:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token inválido o expirado
 */
shipmentRouter.post('/', authMiddleware, shipmentValidator, validation, createShipment);

/**
 * @swagger
 * /api/v1/shipments/tracking/{trackingCode}/status:
 *   get:
 *     summary: Obtiene el estado actual de un envío por su código de seguimiento
 *     tags: [Estado de Envíos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de seguimiento del envío
 *     responses:
 *       200:
 *         description: Estado actual del envío
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ShipmentStatus'
 *       404:
 *         description: Envío no encontrado
 *       403:
 *         description: No autorizado para ver este envío
 */
shipmentRouter.get('/tracking/:trackingCode/status', authMiddleware, getShipmentStatusByTrackingCode);

/**
 * @swagger
 * /api/v1/shipments/tracking/{trackingCode}/history:
 *   get:
 *     summary: Obtiene el historial completo de estados de un envío
 *     tags: [Estado de Envíos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de seguimiento del envío
 *     responses:
 *       200:
 *         description: Historial de estados del envío
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/StatusHistory'
 *       404:
 *         description: Envío no encontrado
 *       403:
 *         description: No autorizado para ver este envío
 */
shipmentRouter.get('/tracking/:trackingCode/history', authMiddleware, getShipmentStatusHistoryByTrackingCode);

/**
 * @swagger
 * /api/v1/shipments/{id}/status:
 *   post:
 *     summary: Actualiza el estado de un envío (solo administradores)
 *     tags: [Estado de Envíos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del envío a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusUpdate'
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Estado del envío actualizado correctamente
 *       400:
 *         description: Parámetros inválidos o estado no permitido
 *       403:
 *         description: Solo los administradores pueden actualizar estados
 *       404:
 *         description: Envío no encontrado
 */
shipmentRouter.post('/:id/status', authMiddleware, roleMiddleware(1), shipmentStatusValidator, validation, updateShipmentStatus);

export default shipmentRouter;