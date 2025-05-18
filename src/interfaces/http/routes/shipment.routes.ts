import { Router } from "express";
import { createShipment } from "../controllers/ShipmentController";
import { shipmentValidator } from "../validators/shipment.validator";
import { validation } from "../validators/validation";
import { authMiddleware } from "../middlewares/authMiddleware";

const shipmentRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Shipments
 *   description: Gestión de envíos
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

export default shipmentRouter;