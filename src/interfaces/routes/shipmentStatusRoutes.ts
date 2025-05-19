import { Router } from "express";
import { ShipmentStatusController } from "../controllers/ShipmentStatusController";
import { authMiddleware } from "../../interfaces/http/middlewares/authMiddleware";
import { ShipmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentPostgresRepository";
import { ShipmentStatusPostgresRepository } from "@infrastructure/db/postgres/ShipmentStatusPostgresRepository";
import { TransporterPostgresRepository } from "@infrastructure/db/postgres/TransporterPostgresRepository";
import { ShipmentAssignmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentAssignmentPostgresRepository";

const router = Router();

// Inyección de dependencias
const shipmentRepository = new ShipmentPostgresRepository();
const statusRepository = new ShipmentStatusPostgresRepository();
const transporterRepository = new TransporterPostgresRepository();
const assignmentRepository = new ShipmentAssignmentPostgresRepository();

const shipmentStatusController = new ShipmentStatusController(
  shipmentRepository,
  statusRepository,
  transporterRepository,
  assignmentRepository
);

// Rutas para seguimiento de estados de envío (HU4)
// Autenticación requerida para todas las rutas
router.use(authMiddleware);

// Obtener estado actual por código de seguimiento
router.get(
  "/tracking/:trackingCode/status",
  (req, res) => shipmentStatusController.getStatusByTrackingCode(req, res)
);

// Obtener historial de estados por código de seguimiento
router.get(
  "/tracking/:trackingCode/history",
  (req, res) => shipmentStatusController.getHistoryByTrackingCode(req, res)
);

// Actualizar estado (solo administradores)
router.post(
  "/:id/status",
  (req, res) => shipmentStatusController.updateStatus(req, res)
);

export default router;
