
export interface IShipmentStatusRepository {
  createInitialStatus(shipmentId: number, userId: number): Promise<void>;
}
