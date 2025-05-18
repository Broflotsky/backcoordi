import { Router } from "express";
import { createShipment } from "../controllers/ShipmentController";
import { shipmentValidator } from "../validators/shipment.validator";
import { validation } from "../validators/validation";
import { authMiddleware } from "../middlewares/authMiddleware";

const shipmentRouter = Router();

shipmentRouter.post('/', authMiddleware, shipmentValidator, validation, createShipment);

export default shipmentRouter;