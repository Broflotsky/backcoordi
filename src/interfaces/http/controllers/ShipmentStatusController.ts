import { Request, Response } from "express";
import { GetShipmentStatus } from "@application/shipments/GetShipmentStatus";
import { GetShipmentStatusHistory } from "@application/shipments/GetShipmentStatusHistory";
import { UpdateShipmentStatus } from "@application/shipments/UpdateShipmentStatus";
import { ShipmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentPostgresRepository";
import { ShipmentStatusPostgresRepository } from "@infrastructure/db/postgres/ShipmentStatusPostgresRepository";
import { TransporterPostgresRepository } from "@infrastructure/db/postgres/TransporterPostgresRepository";
import { ShipmentAssignmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentAssignmentPostgresRepository";

const shipmentRepository = new ShipmentPostgresRepository();
const statusRepository = new ShipmentStatusPostgresRepository();
const transporterRepository = new TransporterPostgresRepository();
const assignmentRepository = new ShipmentAssignmentPostgresRepository();

const getStatusUseCase = new GetShipmentStatus(
  statusRepository,
  shipmentRepository
);
const getHistoryUseCase = new GetShipmentStatusHistory(
  statusRepository,
  shipmentRepository
);
const updateStatusUseCase = new UpdateShipmentStatus(
  statusRepository,
  shipmentRepository,
  transporterRepository,
  assignmentRepository
);

export const getShipmentStatusByTrackingCode = async (
  req: Request,
  res: Response
) => {
  try {
    const { trackingCode } = req.params;
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role_id === 1;

    const shipment = await shipmentRepository.findByTrackingCode(trackingCode);

    if (!shipment) {
      return res.status(404).json({
        status: "error",
        message: `Envío con código ${trackingCode} no encontrado`,
      });
    }

    const shipmentId =
      typeof shipment.id === "number" ? shipment.id : Number(shipment.id);
    const userIdNum = typeof userId === "number" ? userId : Number(userId);

    const status = await getStatusUseCase.execute(
      shipmentId,
      userIdNum,
      isAdmin
    );

    return res.status(200).json({
      status: "success",
      data: status,
    });
  } catch (error: unknown) {
    let errorMessage = "Error desconocido";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error !== null && typeof error === "object") {
      errorMessage = String(error);
    }

    return res.status(400).json({
      status: "error",
      message: errorMessage,
    });
  }
};

export const getShipmentStatusHistoryByTrackingCode = async (
  req: Request,
  res: Response
) => {
  try {
    const { trackingCode } = req.params;
    const userId = (req as any).user.id;
    const isAdmin = (req as any).user.role_id === 1;

    const shipment = await shipmentRepository.findByTrackingCode(trackingCode);

    if (!shipment) {
      return res.status(404).json({
        status: "error",
        message: `Envío con código ${trackingCode} no encontrado`,
      });
    }

    const shipmentId =
      typeof shipment.id === "number" ? shipment.id : Number(shipment.id);
    const userIdNum = typeof userId === "number" ? userId : Number(userId);

    const history = await getHistoryUseCase.execute(
      shipmentId,
      userIdNum,
      isAdmin
    );

    return res.status(200).json({
      status: "success",
      data: history,
    });
  } catch (error: unknown) {
    let errorMessage = "Error desconocido";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error !== null && typeof error === "object") {
      errorMessage = String(error);
    }

    return res.status(400).json({
      status: "error",
      message: errorMessage,
    });
  }
};

export const updateShipmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const adminId = (req as any).user.id;

    const shipmentId = parseInt(id);
    const adminIdNum = typeof adminId === "number" ? adminId : Number(adminId);

    await updateStatusUseCase.execute(shipmentId, status, adminIdNum, comment);

    return res.status(200).json({
      status: "success",
      message: "Estado del envío actualizado correctamente",
    });
  } catch (error: unknown) {
    let errorMessage = "Error desconocido";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error !== null && typeof error === "object") {
      errorMessage = String(error);
    }

    return res.status(400).json({
      status: "error",
      message: errorMessage,
    });
  }
};

export const completeShipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const adminId = (req as any).user.id;

    const shipmentId = parseInt(id);
    const adminIdNum = typeof adminId === "number" ? adminId : Number(adminId);

    await updateStatusUseCase.execute(
      shipmentId,
      "Entregado",
      adminIdNum,
      comment || "Entrega completada"
    );

    return res.status(200).json({
      status: "success",
      message: "Envío marcado como entregado correctamente",
    });
  } catch (error: unknown) {
    let errorMessage = "Error desconocido";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error !== null && typeof error === "object") {
      errorMessage = String(error);
    }

    return res.status(400).json({
      status: "error",
      message: errorMessage,
    });
  }
};
