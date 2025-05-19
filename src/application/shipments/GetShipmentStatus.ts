import { IShipmentStatusRepository } from "@domain/shipments/IShipmentStatusRepository";
import { IShipmentRepository } from "@domain/shipments/IShipmentRepository";

export class GetShipmentStatus {
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

    try {
      const status = await this.statusRepository.getLatestStatus(shipmentId);

      return {
        ...status,
        shipment_code: shipment.tracking_code,
        shipment_origin: shipment.origin_id,
        shipment_destination: shipment.destination_id,
      };
    } catch (error: unknown) {
      let errorMessage = 'Error desconocido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error !== null && typeof error === 'object') {
        errorMessage = String(error);
      }
      
      throw new Error(`No se pudo obtener el estado del envío: ${errorMessage}`);
    }
  }
}
