import { IShipmentStatusRepository } from "@domain/shipments/IShipmentStatusRepository";
import { IShipmentRepository } from "@domain/shipments/IShipmentRepository";

export class GetShipmentStatusHistory {
  constructor(
    private statusRepository: IShipmentStatusRepository,
    private shipmentRepository: IShipmentRepository
  ) {}

  async execute(shipmentId: number, userId: number, isAdmin: boolean) {
    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new Error(`Envío con ID ${shipmentId} no encontrado`);
    }

    if (!isAdmin && shipment.user_id !== userId) {
      throw new Error("No tienes permiso para ver este envío");
    }

    const statusHistory = await this.statusRepository.getStatusHistory(
      shipmentId
    );

    const result = {
      shipment: {
        id: shipment.id,
        tracking_code: shipment.tracking_code,
        origin_id: shipment.origin_id,
        destination_id: shipment.destination_id,
        created_at: shipment.created_at,
      },
      status_history: statusHistory,
    };

    return result;
  }
}
