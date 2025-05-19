export interface IShipmentStatusCacheRepository {
  cacheLatestStatus(
    trackingCode: string,
    statusData: {
      id: number;
      shipment_id: number;
      status: string;
      comment?: string;
      timestamp: Date;
      created_by: number;
      user_name?: string;
    }
  ): Promise<void>;

  getLatestStatusFromCache(trackingCode: string): Promise<{
    id: number;
    shipment_id: number;
    status: string;
    comment?: string;
    timestamp: Date;
    created_by: number;
    user_name?: string;
  } | null>;

  cacheStatusHistory(
    trackingCode: string,
    historyData: Array<{
      id: number;
      shipment_id: number;
      status: string;
      comment?: string;
      timestamp: Date;
      created_by: number;
      user_name?: string;
    }>
  ): Promise<void>;

  getStatusHistoryFromCache(trackingCode: string): Promise<Array<{
    id: number;
    shipment_id: number;
    status: string;
    comment?: string;
    timestamp: Date;
    created_by: number;
    user_name?: string;
  }> | null>;

  invalidateCache(trackingCode: string): Promise<void>;
}
