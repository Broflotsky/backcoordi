export interface IShipmentStatusRepository {
  createInitialStatus(shipmentId: number, userId: number): Promise<void>;

  createStatus(status: {
    shipment_id: number;
    status: string;
    comment?: string;
    created_by: number;
  }): Promise<void>;

  getLatestStatus(shipmentId: number): Promise<{
    id: number;
    shipment_id: number;
    status: string;
    comment?: string;
    timestamp: Date;
    created_by: number;
    user_name?: string;
  }>;

  getStatusHistory(shipmentId: number): Promise<
    Array<{
      id: number;
      shipment_id: number;
      status: string;
      comment?: string;
      timestamp: Date;
      created_by: number;
      user_name?: string;
    }>
  >;

  getLatestStatus(shipmentId: number): Promise<{
    id: number;
    shipment_id: number;
    status: string;
    comment?: string;
    timestamp: Date;
    created_by: number;
    user_name?: string;
  }>;

  getStatusHistory(shipmentId: number): Promise<
    Array<{
      id: number;
      shipment_id: number;
      status: string;
      comment?: string;
      timestamp: Date;
      created_by: number;
      user_name?: string;
    }>
  >;
}
