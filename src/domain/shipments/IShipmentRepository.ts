import { Shipment } from "../entities/Shipment";

export interface IShipmentRepository {
  createShipment(item: Shipment): Promise<Shipment>;
}
