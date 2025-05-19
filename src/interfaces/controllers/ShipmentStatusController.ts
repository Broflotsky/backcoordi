import { Request, Response } from "express";
import { GetShipmentStatus } from "@application/shipments/GetShipmentStatus";
import { GetShipmentStatusHistory } from "@application/shipments/GetShipmentStatusHistory";
import { UpdateShipmentStatus } from "@application/shipments/UpdateShipmentStatus";
import { IShipmentRepository } from "@domain/shipments/IShipmentRepository";
import { IShipmentStatusRepository } from "@domain/shipments/IShipmentStatusRepository";
import { ITransporterRepository } from "@domain/shipments/ITransporterRepository";
import { IShipmentAssignmentRepository } from "@domain/shipments/IShipmentAssignmentRepository";

export class ShipmentStatusController {
  private getStatusUseCase: GetShipmentStatus;
  private getHistoryUseCase: GetShipmentStatusHistory;
  private updateStatusUseCase: UpdateShipmentStatus;

  constructor(
    private shipmentRepository: IShipmentRepository,
    private statusRepository: IShipmentStatusRepository,
    private transporterRepository: ITransporterRepository,
    private assignmentRepository: IShipmentAssignmentRepository
  ) {
    this.getStatusUseCase = new GetShipmentStatus(
      statusRepository,
      shipmentRepository
    );
    this.getHistoryUseCase = new GetShipmentStatusHistory(
      statusRepository,
      shipmentRepository
    );
    this.updateStatusUseCase = new UpdateShipmentStatus(
      statusRepository,
      shipmentRepository,
      transporterRepository,
      assignmentRepository
    );
  }

  /**
   * Obtiene el estado actual de un envío usando su código de seguimiento
   */
  async getStatusByTrackingCode(req: Request, res: Response) {
    try {
      const { trackingCode } = req.params;
      const userId = (req as any).user.id;
      const isAdmin = (req as any).user.role_id === 1;
      
      // 1. Buscar el envío por tracking code
      const shipment = await this.shipmentRepository.findByTrackingCode(trackingCode);
      
      if (!shipment) {
        return res.status(404).json({ 
          status: 'error', 
          message: `Envío con código ${trackingCode} no encontrado` 
        });
      }
      
      // 2. Obtener el estado usando el ID interno
      // Asegurarnos que los IDs son números válidos
      const shipmentId = typeof shipment.id === 'number' ? shipment.id : Number(shipment.id);
      const userIdNum = typeof userId === 'number' ? userId : Number(userId);
      
      const status = await this.getStatusUseCase.execute(
        shipmentId, 
        userIdNum, 
        isAdmin
      );
      
      return res.status(200).json({
        status: 'success',
        data: status
      });
    } catch (error: unknown) {
      // Manejo seguro del error con verificación de tipo
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error !== null && typeof error === 'object') {
        errorMessage = String(error);
      }
      
      return res.status(400).json({
        status: 'error',
        message: errorMessage
      });
    }
  }

  /**
   * Obtiene el historial completo de estados de un envío usando su código de seguimiento
   */
  async getHistoryByTrackingCode(req: Request, res: Response) {
    try {
      const { trackingCode } = req.params;
      const userId = (req as any).user.id;
      const isAdmin = (req as any).user.role_id === 1;
      
      // 1. Buscar el envío por tracking code
      const shipment = await this.shipmentRepository.findByTrackingCode(trackingCode);
      
      if (!shipment) {
        return res.status(404).json({ 
          status: 'error', 
          message: `Envío con código ${trackingCode} no encontrado` 
        });
      }
      
      // 2. Obtener el historial usando el ID interno
      // Asegurarnos que los IDs son números válidos
      const shipmentId = typeof shipment.id === 'number' ? shipment.id : Number(shipment.id);
      const userIdNum = typeof userId === 'number' ? userId : Number(userId);
      
      const history = await this.getHistoryUseCase.execute(
        shipmentId, 
        userIdNum, 
        isAdmin
      );
      
      return res.status(200).json({
        status: 'success',
        data: history
      });
    } catch (error: unknown) {
      // Manejo seguro del error con verificación de tipo
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error !== null && typeof error === 'object') {
        errorMessage = String(error);
      }
      
      return res.status(400).json({
        status: 'error',
        message: errorMessage
      });
    }
  }

  /**
   * Actualiza el estado de un envío (solo admin)
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, comment } = req.body;
      const adminId = (req as any).user.id;
      
      // Verificar si el usuario es administrador
      if ((req as any).user.role_id !== 1) {
        return res.status(403).json({
          status: 'error',
          message: 'Solo los administradores pueden actualizar el estado de los envíos'
        });
      }
      
      // Asegurarnos que los IDs son números válidos
      const shipmentId = parseInt(id);
      const adminIdNum = typeof adminId === 'number' ? adminId : Number(adminId);
      
      // Actualizar el estado del envío
      await this.updateStatusUseCase.execute(
        shipmentId, 
        status, 
        adminIdNum, 
        comment
      );
      
      return res.status(200).json({
        status: 'success',
        message: 'Estado del envío actualizado correctamente'
      });
    } catch (error: unknown) {
      // Manejo seguro del error con verificación de tipo
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error !== null && typeof error === 'object') {
        errorMessage = String(error);
      }
      
      return res.status(400).json({
        status: 'error',
        message: errorMessage
      });
    }
  }
}
