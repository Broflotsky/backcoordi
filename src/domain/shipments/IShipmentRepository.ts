import { Shipment } from "../entities/Shipment";

export interface IShipmentRepository {
  createShipment(item: Shipment): Promise<Shipment>;
  findById(id: number): Promise<Shipment | null>;
  findByStatus(status: string): Promise<Shipment[]>;
  getAll(): Promise<Shipment[]>;
}
