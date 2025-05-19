import { Router } from "express";
import { ShipmentStatusController } from "../controllers/ShipmentStatusController";
import { authMiddleware } from "../../interfaces/http/middlewares/authMiddleware";
import { ShipmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentPostgresRepository";
import { ShipmentStatusPostgresRepository } from "@infrastructure/db/postgres/ShipmentStatusPostgresRepository";
import { TransporterPostgresRepository } from "@infrastructure/db/postgres/TransporterPostgresRepository";
import { ShipmentAssignmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentAssignmentPostgresRepository";

const router = Router();

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

router.use(authMiddleware);

router.get("/tracking/:trackingCode/status", (req, res) =>
  shipmentStatusController.getStatusByTrackingCode(req, res)
);

router.get("/tracking/:trackingCode/history", (req, res) =>
  shipmentStatusController.getHistoryByTrackingCode(req, res)
);
router.post("/:id/status", (req, res) =>
  shipmentStatusController.updateStatus(req, res)
);

export default router;
