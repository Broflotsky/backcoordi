import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { ShipmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentPostgresRepository";
import { ShipmentStatusPostgresRepository } from "@infrastructure/db/postgres/ShipmentStatusPostgresRepository";
import { TransporterPostgresRepository } from "@infrastructure/db/postgres/TransporterPostgresRepository";
import { ShipmentAssignmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentAssignmentPostgresRepository";
import { ShipmentStatusController } from "../../controllers/ShipmentStatusController";

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

router.get("/tracking/:trackingCode", (req, res) =>
  shipmentStatusController.getStatusByTrackingCode(req, res)
);

router.get("/tracking/:trackingCode/history", (req, res) =>
  shipmentStatusController.getHistoryByTrackingCode(req, res)
);

router.post("/update/:id", (req, res) =>
  shipmentStatusController.updateStatus(req, res)
);

export default router;
