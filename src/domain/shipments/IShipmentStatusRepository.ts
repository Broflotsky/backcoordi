
export interface IShipmentStatusRepository {
  createInitialStatus(shipmentId: number, userId: number): Promise<void>;
  createStatus(status: { shipment_id: number; status: string; comment?: string; created_by: number }): Promise<void>;
}
